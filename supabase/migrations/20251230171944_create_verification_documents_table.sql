-- Verification documents table
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Index for profile lookups
CREATE INDEX idx_verification_docs_profile ON verification_documents(profile_id);

-- Enable RLS
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Only profile owner can manage their verification documents
CREATE POLICY "Profile owners can manage verification docs" ON verification_documents
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );
