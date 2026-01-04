-- Analytics Events Table - Core event tracking
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  visitor_ip TEXT,
  viewer_profile_id UUID REFERENCES profiles(id),
  is_verified_viewer BOOLEAN DEFAULT false,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  country TEXT,
  city TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_analytics_profile_id ON analytics_events(profile_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_viewer_profile ON analytics_events(viewer_profile_id);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert analytics events
CREATE POLICY "Anyone can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Policy: Users can read their own profile's analytics
CREATE POLICY "Users can read own profile analytics" ON analytics_events
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()::text
    )
  );
