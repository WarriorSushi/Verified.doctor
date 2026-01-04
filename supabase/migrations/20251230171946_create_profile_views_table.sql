-- Profile views table - analytics
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for profile lookups
CREATE INDEX idx_profile_views_profile ON profile_views(profile_id);

-- Enable RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (tracking)
CREATE POLICY "Anyone can record views" ON profile_views
  FOR INSERT WITH CHECK (true);

-- Only profile owner can view their analytics
CREATE POLICY "Profile owners can view analytics" ON profile_views
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );
