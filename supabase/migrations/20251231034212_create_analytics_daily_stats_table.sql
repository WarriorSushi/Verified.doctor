-- Analytics Daily Stats Table - Aggregated daily statistics
CREATE TABLE analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  verified_doctor_views INTEGER DEFAULT 0,
  click_save_contact INTEGER DEFAULT 0,
  click_book_appointment INTEGER DEFAULT 0,
  click_send_inquiry INTEGER DEFAULT 0,
  click_recommend INTEGER DEFAULT 0,
  inquiries_received INTEGER DEFAULT 0,
  recommendations_received INTEGER DEFAULT 0,
  mobile_views INTEGER DEFAULT 0,
  tablet_views INTEGER DEFAULT 0,
  desktop_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, date)
);

-- Index for fast queries
CREATE INDEX idx_daily_stats_profile_date ON analytics_daily_stats(profile_id, date);

-- Enable RLS
ALTER TABLE analytics_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile's daily stats
CREATE POLICY "Users can read own profile daily stats" ON analytics_daily_stats
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Service role can insert/update (for aggregation job)
CREATE POLICY "Service role can manage daily stats" ON analytics_daily_stats
  FOR ALL USING (true) WITH CHECK (true);
