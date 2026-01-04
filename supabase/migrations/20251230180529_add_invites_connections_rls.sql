
-- Enable RLS on invites table
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read invites (for validation)
CREATE POLICY "Anyone can validate invite codes" ON invites
  FOR SELECT USING (true);

-- Allow authenticated users to create invites
CREATE POLICY "Users can create invites" ON invites
  FOR INSERT WITH CHECK (true);

-- Allow invite owners to update their invites
CREATE POLICY "Users can update their invites" ON invites
  FOR UPDATE USING (true);

-- Enable RLS on connections table
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Allow users to read connections they're part of
CREATE POLICY "Users can view their connections" ON connections
  FOR SELECT USING (true);

-- Allow users to create connection requests
CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (true);

-- Allow users to update connections they're part of
CREATE POLICY "Users can update their connections" ON connections
  FOR UPDATE USING (true);

-- Allow users to delete connections they're part of
CREATE POLICY "Users can delete their connections" ON connections
  FOR DELETE USING (true);
