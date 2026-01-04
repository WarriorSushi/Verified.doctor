-- Fix function search paths for security

-- increment_view_count
CREATE OR REPLACE FUNCTION public.increment_view_count(profile_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = profile_uuid;
END;
$$;

-- increment_recommendation_count
CREATE OR REPLACE FUNCTION public.increment_recommendation_count(profile_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET recommendation_count = recommendation_count + 1,
      updated_at = now()
  WHERE id = profile_uuid;
END;
$$;

-- increment_connection_counts (for both profiles)
CREATE OR REPLACE FUNCTION public.increment_connection_counts(profile1_uuid uuid, profile2_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET connection_count = connection_count + 1,
      updated_at = now()
  WHERE id IN (profile1_uuid, profile2_uuid);
END;
$$;

-- increment_connection_count (single profile)
CREATE OR REPLACE FUNCTION public.increment_connection_count(profile_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET connection_count = COALESCE(connection_count, 0) + 1
  WHERE id = profile_uuid;
END;
$$;

-- decrement_connection_count
CREATE OR REPLACE FUNCTION public.decrement_connection_count(profile_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET connection_count = GREATEST(COALESCE(connection_count, 0) - 1, 0)
  WHERE id = profile_uuid;
END;
$$;

-- update_daily_stats (trigger function)
CREATE OR REPLACE FUNCTION public.update_daily_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert or update daily stats for this profile and date
  INSERT INTO public.analytics_daily_stats (profile_id, date)
  VALUES (NEW.profile_id, DATE(NEW.created_at))
  ON CONFLICT (profile_id, date) DO NOTHING;

  -- Update the appropriate counter based on event type
  UPDATE public.analytics_daily_stats
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
$$;
