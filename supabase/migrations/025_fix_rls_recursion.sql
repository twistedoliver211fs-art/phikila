-- Fix infinite recursion in school_members RLS policy
-- The get_user_school_ids() SECURITY DEFINER function queries school_members,
-- but the RLS policy on school_members calls get_user_school_ids() causing recursion.

-- Drop the recursive policy
DROP POLICY IF EXISTS "Members: view own school members" ON school_members;

-- Recreate with a direct auth.uid() check (no subquery needed)
CREATE POLICY "Members: view own school members" ON school_members
  FOR SELECT USING (
    user_id = auth.uid() OR is_super_admin()
  );

-- Also fix profiles policy that references school_members
DROP POLICY IF EXISTS "Profiles: members can view school_members" ON profiles;

CREATE POLICY "Profiles: members can view school_members" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR is_super_admin()
  );
