-- Invites table - colleague invitations
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  invitee_email TEXT,
  used BOOLEAN DEFAULT false,
  used_by_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for invite code lookups
CREATE INDEX idx_invites_code ON invites(invite_code);

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Anyone can read invites (to validate codes)
CREATE POLICY "Invites are readable by everyone" ON invites
  FOR SELECT USING (true);
