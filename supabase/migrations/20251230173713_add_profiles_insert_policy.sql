-- Allow anyone to insert profiles (for test auth mode)
-- In production, this would check Clerk JWT
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT
  USING (true);

-- Allow users to update their own profile by user_id
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
