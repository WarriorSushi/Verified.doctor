
-- Add separate layout and theme columns for better UX
-- Layout controls the structure, Theme controls the colors

-- Add profile_layout column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_layout TEXT DEFAULT 'classic';

-- Add profile_theme column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_theme TEXT DEFAULT 'blue';

-- Migrate existing profile_template data to new columns
-- Map old templates to new layout + theme combinations
UPDATE profiles SET
  profile_layout = CASE
    WHEN profile_template IN ('classic', 'ocean', 'sage', 'warm') THEN 'classic'
    WHEN profile_template = 'executive' THEN 'classic'
    WHEN profile_template = 'hero' THEN 'hero'
    WHEN profile_template = 'timeline' THEN 'timeline'
    ELSE 'classic'
  END,
  profile_theme = CASE
    WHEN profile_template = 'classic' THEN 'blue'
    WHEN profile_template = 'ocean' THEN 'ocean'
    WHEN profile_template = 'sage' THEN 'sage'
    WHEN profile_template = 'warm' THEN 'warm'
    WHEN profile_template = 'executive' THEN 'executive'
    WHEN profile_template = 'hero' THEN 'teal'
    WHEN profile_template = 'timeline' THEN 'warm'
    ELSE 'blue'
  END
WHERE profile_layout IS NULL OR profile_theme IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.profile_layout IS 'Layout structure: classic, hero, timeline';
COMMENT ON COLUMN profiles.profile_theme IS 'Color theme: blue, ocean, sage, warm, executive, teal';
