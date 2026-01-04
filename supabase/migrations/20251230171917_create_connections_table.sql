-- Connections table - doctor-to-doctor connections
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Indexes for connection lookups
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can view connections they're part of
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (
    requester_id IN (SELECT id FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')
    OR receiver_id IN (SELECT id FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );
