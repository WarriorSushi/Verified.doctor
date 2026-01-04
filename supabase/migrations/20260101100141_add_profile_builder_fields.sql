-- Profile Builder Enhancement Migration
-- Adds new fields for enriched doctor profiles

-- Text/URL fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_introduction_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approach_to_care text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_visit_guide text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_note text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS conditions_treated text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS procedures_performed text;

-- Boolean fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS offers_telemedicine boolean DEFAULT false;

-- JSONB array fields for structured data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_timeline jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hospital_affiliations jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS case_studies jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clinic_gallery jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_memberships jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS media_publications jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievement_badges jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS section_visibility jsonb DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN profiles.video_introduction_url IS 'YouTube or Vimeo URL for doctor video introduction';
COMMENT ON COLUMN profiles.education_timeline IS 'Array of {institution, degree, year} objects';
COMMENT ON COLUMN profiles.hospital_affiliations IS 'Array of {name, role, department} objects';
COMMENT ON COLUMN profiles.case_studies IS 'Array of {title, description, outcome} objects';
COMMENT ON COLUMN profiles.clinic_gallery IS 'Array of image URLs for clinic photos';
COMMENT ON COLUMN profiles.professional_memberships IS 'Array of {organization, year} objects';
COMMENT ON COLUMN profiles.media_publications IS 'Array of {title, publication, link, year} objects';
COMMENT ON COLUMN profiles.achievement_badges IS 'Array of badge IDs assigned by admin';
COMMENT ON COLUMN profiles.section_visibility IS 'Object with section keys and boolean visibility values';
