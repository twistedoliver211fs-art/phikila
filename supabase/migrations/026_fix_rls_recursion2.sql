-- Fix the remaining recursion: "Members: principals can manage their school members" 
-- has cmd=ALL and queries school_members, causing recursion on SELECT

-- Drop the ALL policy and recreate as INSERT/UPDATE/DELETE only
DROP POLICY IF EXISTS "Members: principals can manage their school members" ON school_members;

CREATE POLICY "Members: principals can manage their school members" ON school_members
  FOR INSERT WITH CHECK (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() 
        AND sm.role IN ('principal', 'super_admin') 
        AND sm.is_active = true
    ) OR is_super_admin()
  );

CREATE POLICY "Members: principals can update their school members" ON school_members
  FOR UPDATE USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() 
        AND sm.role IN ('principal', 'super_admin') 
        AND sm.is_active = true
    ) OR is_super_admin()
  );
