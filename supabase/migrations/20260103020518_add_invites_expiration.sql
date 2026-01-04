-- Add expires_at column to invites table for invite expiration (30 days default)
ALTER TABLE invites
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');

-- Update existing invites to have an expiration date (30 days from creation)
UPDATE invites
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- Add index for expiration queries
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);

-- Add indexes for foreign keys (performance fix)
CREATE INDEX IF NOT EXISTS idx_invites_inviter_profile_id ON invites(inviter_profile_id);
CREATE INDEX IF NOT EXISTS idx_invites_used_by_profile_id ON invites(used_by_profile_id);

COMMENT ON COLUMN invites.expires_at IS 'When the invite expires (default 30 days from creation)';
