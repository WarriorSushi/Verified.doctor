-- Profiles table - core user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  clinic_name TEXT,
  clinic_location TEXT,
  years_experience INTEGER,
  profile_photo_url TEXT,
  external_booking_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected')),
  recommendation_count INTEGER DEFAULT 0,
  connection_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for handle lookups (public profile pages)
CREATE INDEX idx_profiles_handle ON profiles(handle);

-- Index for user lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles (public)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
