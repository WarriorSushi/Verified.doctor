-- Function to update daily stats when an event is tracked
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily stats for this profile and date
  INSERT INTO analytics_daily_stats (profile_id, date)
  VALUES (NEW.profile_id, DATE(NEW.created_at))
  ON CONFLICT (profile_id, date) DO NOTHING;

  -- Update the appropriate counter based on event type
  UPDATE analytics_daily_stats
  SET
    total_views = total_views + CASE WHEN NEW.event_type = 'profile_view' THEN 1 ELSE 0 END,
    verified_doctor_views = verified_doctor_views + CASE WHEN NEW.event_type = 'profile_view' AND NEW.is_verified_viewer THEN 1 ELSE 0 END,
    click_save_contact = click_save_contact + CASE WHEN NEW.event_type = 'click_save_contact' THEN 1 ELSE 0 END,
    click_book_appointment = click_book_appointment + CASE WHEN NEW.event_type = 'click_book_appointment' THEN 1 ELSE 0 END,
    click_send_inquiry = click_send_inquiry + CASE WHEN NEW.event_type = 'click_send_inquiry' THEN 1 ELSE 0 END,
    click_recommend = click_recommend + CASE WHEN NEW.event_type = 'click_recommend' THEN 1 ELSE 0 END,
    inquiries_received = inquiries_received + CASE WHEN NEW.event_type = 'inquiry_sent' THEN 1 ELSE 0 END,
    recommendations_received = recommendations_received + CASE WHEN NEW.event_type = 'recommendation_given' THEN 1 ELSE 0 END,
    mobile_views = mobile_views + CASE WHEN NEW.event_type = 'profile_view' AND NEW.device_type = 'mobile' THEN 1 ELSE 0 END,
    tablet_views = tablet_views + CASE WHEN NEW.event_type = 'profile_view' AND NEW.device_type = 'tablet' THEN 1 ELSE 0 END,
    desktop_views = desktop_views + CASE WHEN NEW.event_type = 'profile_view' AND NEW.device_type = 'desktop' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE profile_id = NEW.profile_id AND date = DATE(NEW.created_at);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update daily stats
CREATE TRIGGER trigger_update_daily_stats
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats();
