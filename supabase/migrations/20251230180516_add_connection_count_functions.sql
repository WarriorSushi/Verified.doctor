
-- Create function to increment connection count
CREATE OR REPLACE FUNCTION increment_connection_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET connection_count = COALESCE(connection_count, 0) + 1
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement connection count
CREATE OR REPLACE FUNCTION decrement_connection_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET connection_count = GREATEST(COALESCE(connection_count, 0) - 1, 0)
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql;
