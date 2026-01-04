-- Add account freeze columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMPTZ;

-- Create email automation tables
CREATE TABLE IF NOT EXISTS automation_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scheduled/pending emails to be sent
CREATE TABLE IF NOT EXISTS automation_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_slug TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track sent emails for analytics and preventing duplicates
CREATE TABLE IF NOT EXISTS automation_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_slug TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL, -- sent, failed, bounced, opened, clicked
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track user lifecycle stage for automation triggers
CREATE TABLE IF NOT EXISTS user_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- signup, profile_created, verification_pending, verified, frozen, unfrozen, inactive_7d, inactive_30d
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON automation_email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON automation_email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_profile ON automation_email_queue(profile_id);
CREATE INDEX IF NOT EXISTS idx_email_log_profile ON automation_email_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_profile ON user_lifecycle_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_type ON user_lifecycle_events(event_type);

-- Insert default email templates
INSERT INTO automation_email_templates (slug, name, subject, body_html, body_text, description) VALUES
('frozen_nudge', 'Frozen Account Nudge', 'We miss you! Your Verified.Doctor profile is offline',
'<h1>Your profile is currently offline</h1><p>Hi {{full_name}},</p><p>Your Verified.Doctor profile at <strong>verified.doctor/{{handle}}</strong> is currently frozen and not visible to patients.</p><p>Unfreeze your profile to:</p><ul><li>Receive patient inquiries</li><li>Get recommendations</li><li>Grow your professional network</li></ul><p><a href="{{dashboard_url}}">Unfreeze your profile now</a></p>',
'Hi {{full_name}}, Your profile at verified.doctor/{{handle}} is offline. Visit your dashboard to unfreeze it.',
'Email sent to users who have frozen their profile'
),
('incomplete_profile', 'Incomplete Profile Reminder', 'Complete your Verified.Doctor profile to start receiving patients',
'<h1>Your profile is almost ready!</h1><p>Hi {{full_name}},</p><p>You''ve claimed your URL at <strong>verified.doctor/{{handle}}</strong> but haven''t completed your profile yet.</p><p>Complete your profile to:</p><ul><li>Appear in search results</li><li>Receive patient inquiries</li><li>Build your online reputation</li></ul><p><a href="{{dashboard_url}}">Complete your profile</a></p>',
'Hi {{full_name}}, Complete your profile at verified.doctor/{{handle}} to start receiving patients.',
'Email sent to users who signed up but did not complete profile'
),
('verification_reminder', 'Verification Reminder', 'Get verified on Verified.Doctor - Stand out from the crowd',
'<h1>Get your verified badge!</h1><p>Hi {{full_name}},</p><p>Your profile at <strong>verified.doctor/{{handle}}</strong> is live but not yet verified.</p><p>Getting verified gives you:</p><ul><li>A trusted blue badge on your profile</li><li>Higher visibility in search results</li><li>More patient trust and inquiries</li></ul><p><a href="{{verification_url}}">Upload verification documents</a></p>',
'Hi {{full_name}}, Get verified at verified.doctor/{{handle}} to build more patient trust.',
'Email sent to users who have completed profile but not verified'
),
('welcome', 'Welcome Email', 'Welcome to Verified.Doctor!',
'<h1>Welcome to Verified.Doctor!</h1><p>Hi {{full_name}},</p><p>Thank you for joining Verified.Doctor! Your professional profile is now live at:</p><p><strong>verified.doctor/{{handle}}</strong></p><p>Next steps:</p><ol><li>Complete your profile with specialty and clinic details</li><li>Upload verification documents for the verified badge</li><li>Share your profile URL with patients</li></ol><p><a href="{{dashboard_url}}">Go to your dashboard</a></p>',
'Welcome to Verified.Doctor! Your profile is live at verified.doctor/{{handle}}.',
'Welcome email sent immediately after signup'
)
ON CONFLICT (slug) DO NOTHING;
