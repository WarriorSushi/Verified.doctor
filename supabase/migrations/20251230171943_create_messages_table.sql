-- Messages table - patient inquiries to doctors
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  message_content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  reply_content TEXT,
  reply_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for profile lookups
CREATE INDEX idx_messages_profile ON messages(profile_id);
CREATE INDEX idx_messages_unread ON messages(profile_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert messages (public inquiry)
CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Only profile owner can view their messages
CREATE POLICY "Profile owners can view messages" ON messages
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );

-- Only profile owner can update their messages
CREATE POLICY "Profile owners can update messages" ON messages
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );
