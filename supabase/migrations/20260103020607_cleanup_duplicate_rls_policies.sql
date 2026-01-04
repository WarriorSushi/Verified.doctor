-- Remove duplicate policies to improve performance

-- profiles: Remove duplicate INSERT policy
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- profiles: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- connections: Remove overly permissive SELECT policy (keep the one with proper checks)
DROP POLICY IF EXISTS "Users can view their connections" ON connections;

-- invites: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Anyone can validate invite codes" ON invites;

-- messages: Remove overly permissive SELECT policy (keep the one with proper checks)
DROP POLICY IF EXISTS "Profile owners can read messages" ON messages;

-- recommendations: Remove duplicate INSERT policy
DROP POLICY IF EXISTS "Anyone can create recommendations" ON recommendations;

-- recommendations: Remove overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read recommendations" ON recommendations;

-- analytics_daily_stats: The service role policy covers all, remove specific SELECT
-- Actually keep both as service role needs all and users need SELECT on their own data
