-- Enable RLS on automation tables
ALTER TABLE public.automation_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lifecycle_events ENABLE ROW LEVEL SECURITY;

-- These tables should only be accessed by service role (admin/server-side)
-- No policies needed - service role bypasses RLS
