-- Add more fields to profiles for richer public profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS qualifications TEXT, -- e.g., "MBBS, MD (Cardiology)"
ADD COLUMN IF NOT EXISTS languages TEXT, -- e.g., "English, Hindi, Marathi"
ADD COLUMN IF NOT EXISTS registration_number TEXT, -- Medical council registration
ADD COLUMN IF NOT EXISTS consultation_fee TEXT, -- e.g., "₹500" or "₹500-1000"
ADD COLUMN IF NOT EXISTS services TEXT, -- What they offer, comma separated
ADD COLUMN IF NOT EXISTS profile_template TEXT DEFAULT 'classic'; -- Template for public page

-- Add comment to explain templates
COMMENT ON COLUMN profiles.profile_template IS 'Template for public profile: classic, modern, minimal, professional';
