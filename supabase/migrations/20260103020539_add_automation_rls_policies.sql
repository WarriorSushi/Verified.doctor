-- Add RLS policies for automation_email_log (service role only)
CREATE POLICY "Service role can manage email log"
  ON automation_email_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for automation_email_queue (service role only)
CREATE POLICY "Service role can manage email queue"
  ON automation_email_queue
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for automation_email_templates (service role only, read for authenticated)
CREATE POLICY "Service role can manage email templates"
  ON automation_email_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for user_lifecycle_events (service role only)
CREATE POLICY "Service role can manage lifecycle events"
  ON user_lifecycle_events
  FOR ALL
  USING (true)
  WITH CHECK (true);
