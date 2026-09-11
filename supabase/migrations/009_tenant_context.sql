-- Migration 009: Tenant Context
-- Adds active_school_id to profiles for explicit school context tracking

-- Add active_school_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_school_id uuid REFERENCES schools(id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_active_school ON profiles(active_school_id);

-- RLS: users can only set active_school_id to a school they belong to
-- The existing "Profiles: users can update own" policy already restricts updates to own profile
-- We add a check constraint for the foreign key relationship
-- Note: The FK constraint itself prevents invalid school_ids, but we also want
-- to ensure the user is a member of that school at the application level.

-- Add a function to validate active_school_id membership
CREATE OR REPLACE FUNCTION validate_active_school_membership()
RETURNS trigger AS $$
BEGIN
  IF NEW.active_school_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM school_members
      WHERE user_id = NEW.id
        AND school_id = NEW.active_school_id
        AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Cannot set active_school_id to a school you are not a member of';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS validate_active_school ON profiles;
CREATE TRIGGER validate_active_school
  BEFORE UPDATE OF active_school_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_active_school_membership();
