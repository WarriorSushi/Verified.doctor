
-- Migration: Fix RLS policy performance by wrapping auth calls in SELECT subquery
-- This prevents re-evaluation of auth functions per row

-- Helper function in public schema to get current user_id efficiently
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'sub'),
    (auth.uid())::text
  )
$$;

-- 1. Fix: profiles - "Users can insert own profile"
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    user_id = (SELECT public.current_user_id())
  );

-- 2. Fix: connections - "Users can view own connections"
DROP POLICY IF EXISTS "Users can view own connections" ON connections;
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (
    requester_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
    OR receiver_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );

-- 3. Fix: recommendations - "Profile owners can view recommendations"
DROP POLICY IF EXISTS "Profile owners can view recommendations" ON recommendations;
CREATE POLICY "Profile owners can view recommendations" ON recommendations
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );

-- 4. Fix: messages - "Profile owners can view messages"
DROP POLICY IF EXISTS "Profile owners can view messages" ON messages;
CREATE POLICY "Profile owners can view messages" ON messages
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );

-- 5. Fix: verification_documents - "Profile owners can manage verification docs"
DROP POLICY IF EXISTS "Profile owners can manage verification docs" ON verification_documents;
CREATE POLICY "Profile owners can manage verification docs" ON verification_documents
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );

-- 6. Fix: profile_views - "Profile owners can view analytics"
DROP POLICY IF EXISTS "Profile owners can view analytics" ON profile_views;
CREATE POLICY "Profile owners can view analytics" ON profile_views
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );

-- 7. Fix: analytics_events - "Users can read own profile analytics"
DROP POLICY IF EXISTS "Users can read own profile analytics" ON analytics_events;
CREATE POLICY "Users can read own profile analytics" ON analytics_events
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );

-- 8. Fix: analytics_daily_stats - overlapping policies issue
-- Remove the overly permissive ALL policy and separate by operation
DROP POLICY IF EXISTS "Users can read own profile daily stats" ON analytics_daily_stats;
DROP POLICY IF EXISTS "Service role can manage daily stats" ON analytics_daily_stats;

-- Recreate SELECT policy with proper optimization
CREATE POLICY "Users can read own profile daily stats" ON analytics_daily_stats
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );

-- Separate INSERT/UPDATE/DELETE policies (service role bypasses RLS anyway)
CREATE POLICY "Allow insert daily stats" ON analytics_daily_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update daily stats" ON analytics_daily_stats
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete daily stats" ON analytics_daily_stats
  FOR DELETE USING (true);

-- Ensure index exists for faster user_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
