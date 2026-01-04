-- Recommendations table - patient recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, fingerprint)
);

-- Index for profile lookups
CREATE INDEX idx_recommendations_profile ON recommendations(profile_id);

-- Enable RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert recommendations (public action)
CREATE POLICY "Anyone can insert recommendations" ON recommendations
  FOR INSERT WITH CHECK (true);

-- Only profile owner can view their recommendations
CREATE POLICY "Profile owners can view recommendations" ON recommendations
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );
