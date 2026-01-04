-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'support', 'verification', 'billing', 'partnership', 'feedback', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  replied_at TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Only service role can access (admin only)
CREATE POLICY "Service role can manage contact messages"
  ON contact_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for querying by status
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from the website';
