-- Create admin audit logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  admin_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin_audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs (no public access)
CREATE POLICY "Service role only" ON admin_audit_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Add comment
COMMENT ON TABLE admin_audit_logs IS 'Audit trail for admin actions (verification approvals, rejections, etc.)';
