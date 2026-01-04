-- Function to increment view count atomically
CREATE OR REPLACE FUNCTION increment_view_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment recommendation count atomically
CREATE OR REPLACE FUNCTION increment_recommendation_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET recommendation_count = recommendation_count + 1,
      updated_at = now()
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment connection count for both users
CREATE OR REPLACE FUNCTION increment_connection_counts(profile1_uuid UUID, profile2_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET connection_count = connection_count + 1,
      updated_at = now()
  WHERE id IN (profile1_uuid, profile2_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
