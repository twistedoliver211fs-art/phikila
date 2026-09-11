-- Migration 008: Self-registration and role management
-- Allows authenticated users to create schools and become principals.
-- Adds RLS policies for self-registration and admin management.

-- 1. Allow authenticated users to INSERT schools with status 'pending'
--    (The API route uses service_role to bypass RLS, but this is a safety net)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Schools: authenticated users can register new schools' AND tablename = 'schools') THEN
    create policy "Schools: authenticated users can register new schools"
      on schools
      for insert
      to authenticated
      with check (status = 'pending');
  END IF;
END $$;

-- 2. Allow authenticated users to INSERT their own school_members row
--    when the school was just created by them (pending status, they are the first member)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Schools: new owners can add themselves as principal' AND tablename = 'school_members') THEN
    create policy "Schools: new owners can add themselves as principal"
      on school_members
      for insert
      to authenticated
      with check (
        user_id = auth.uid()
        and school_id in (
          select id from schools
          where status = 'pending'
          and created_at > now() - interval '5 minutes'
        )
      );
  END IF;
END $$;

-- 3. Allow school principals and super admins to update school_members (role assignment)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members: principals can manage their school members' AND tablename = 'school_members') THEN
    create policy "Members: principals can manage their school members"
      on school_members
      for all
      using (
        school_id in (
          select school_id from school_members
          where user_id = auth.uid()
          and role in ('principal', 'super_admin')
          and is_active = true
        )
        or is_super_admin()
      );
  END IF;
END $$;

-- 4. Allow super admins to update schools (approve, change subscription, etc.)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Schools: super admin can update all' AND tablename = 'schools') THEN
    create policy "Schools: super admin can update all"
      on schools
      for update
      using (is_super_admin());
  END IF;
END $$;

-- 5. Allow super admins to delete school_members
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members: super admin can delete' AND tablename = 'school_members') THEN
    create policy "Members: super admin can delete"
      on school_members
      for delete
      using (is_super_admin());
  END IF;
END $$;

-- 6. Allow principals to delete members from their own school
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members: principals can remove their school members' AND tablename = 'school_members') THEN
    create policy "Members: principals can remove their school members"
      on school_members
      for delete
      using (
        school_id in (
          select school_id from school_members
          where user_id = auth.uid()
          and role = 'principal'
          and is_active = true
        )
      );
  END IF;
END $$;
