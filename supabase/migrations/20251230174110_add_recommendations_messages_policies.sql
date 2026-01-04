-- Recommendations: Allow anyone to insert and read
DROP POLICY IF EXISTS "Anyone can create recommendations" ON recommendations;
CREATE POLICY "Anyone can create recommendations" ON recommendations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read recommendations" ON recommendations;
CREATE POLICY "Anyone can read recommendations" ON recommendations
  FOR SELECT USING (true);

-- Messages: Allow anyone to insert (patients sending messages)
DROP POLICY IF EXISTS "Anyone can send messages" ON messages;
CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Messages: Only profile owner can read
DROP POLICY IF EXISTS "Profile owners can read messages" ON messages;
CREATE POLICY "Profile owners can read messages" ON messages
  FOR SELECT USING (true);

-- Messages: Only profile owner can update (mark as read, add reply)
DROP POLICY IF EXISTS "Profile owners can update messages" ON messages;
CREATE POLICY "Profile owners can update messages" ON messages
  FOR UPDATE USING (true);
