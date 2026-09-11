-- Migration 010: RBAC V2 — Granular Permissions
-- Adds permissions table, role_permissions, and custom role support

-- ============================================================
-- PERMISSIONS
-- ============================================================

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(resource, action)
);

CREATE INDEX idx_permissions_resource ON permissions(resource);

-- ============================================================
-- ROLE PERMISSIONS (maps built-in roles to permissions)
-- ============================================================

CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role member_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);

-- ============================================================
-- CUSTOM ROLES (school-defined roles)
-- ============================================================

CREATE TABLE custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, name)
);

CREATE INDEX idx_custom_roles_school ON custom_roles(school_id);

-- ============================================================
-- CUSTOM ROLE ASSIGNMENTS
-- ============================================================

CREATE TABLE custom_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_member_id uuid NOT NULL REFERENCES school_members(id) ON DELETE CASCADE,
  custom_role_id uuid NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_member_id, custom_role_id)
);

-- ============================================================
-- CUSTOM ROLE PERMISSIONS
-- ============================================================

CREATE TABLE custom_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_role_id uuid NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(custom_role_id, permission_id)
);

-- ============================================================
-- HAS_PERMISSION FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION has_permission(
  p_user_id uuid,
  p_school_id uuid,
  p_resource text,
  p_action text
) RETURNS boolean AS $$
  SELECT EXISTS (
    -- Check built-in role permissions
    SELECT 1 FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN school_members sm ON sm.role = rp.role
    WHERE sm.user_id = p_user_id
      AND sm.school_id = p_school_id
      AND sm.is_active = true
      AND p.resource = p_resource
      AND p.action = p_action
  ) OR EXISTS (
    -- Check custom role permissions
    SELECT 1 FROM custom_role_assignments cra
    JOIN custom_role_permissions crp ON crp.custom_role_id = cra.custom_role_id
    JOIN permissions p ON p.id = crp.permission_id
    JOIN school_members sm ON sm.id = cra.school_member_id
    WHERE sm.user_id = p_user_id
      AND sm.school_id = p_school_id
      AND sm.is_active = true
      AND p.resource = p_resource
      AND p.action = p_action
  ) OR is_super_admin();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- GET_USER_PERMISSIONS FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id uuid,
  p_school_id uuid
) RETURNS SETOF text AS $$
  SELECT DISTINCT p.resource || '.' || p.action
  FROM permissions p
  WHERE has_permission(p_user_id, p_school_id, p.resource, p.action);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_role_permissions ENABLE ROW LEVEL SECURITY;

-- Permissions: readable by everyone (needed for UI), managed by super_admin
CREATE POLICY "Permissions: public read" ON permissions
  FOR SELECT USING (true);

CREATE POLICY "Permissions: super admin manage" ON permissions
  FOR ALL USING (is_super_admin());

-- Role permissions: readable by everyone, managed by super_admin
CREATE POLICY "Role permissions: public read" ON role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Role permissions: super admin manage" ON role_permissions
  FOR ALL USING (is_super_admin());

-- Custom roles: school members can view, principal/super_admin can manage
CREATE POLICY "Custom roles: school members read" ON custom_roles
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "Custom roles: principal can manage" ON custom_roles
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid()
        AND sm.role IN ('super_admin', 'principal')
        AND sm.is_active = true
    )
  );

-- Custom role assignments: school members can view, principal can manage
CREATE POLICY "Custom role assignments: school members read" ON custom_role_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_roles cr
      JOIN school_members sm ON sm.school_id = cr.school_id
      WHERE cr.id = custom_role_assignments.custom_role_id
        AND sm.user_id = auth.uid()
        AND sm.is_active = true
    ) OR is_super_admin()
  );

CREATE POLICY "Custom role assignments: principal can manage" ON custom_role_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_roles cr
      JOIN school_members sm ON sm.school_id = cr.school_id
      WHERE cr.id = custom_role_assignments.custom_role_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('super_admin', 'principal')
        AND sm.is_active = true
    )
  );

-- Custom role permissions: school members can view, principal can manage
CREATE POLICY "Custom role permissions: school members read" ON custom_role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_roles cr
      JOIN school_members sm ON sm.school_id = cr.school_id
      WHERE cr.id = custom_role_permissions.custom_role_id
        AND sm.user_id = auth.uid()
        AND sm.is_active = true
    ) OR is_super_admin()
  );

CREATE POLICY "Custom role permissions: principal can manage" ON custom_role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_roles cr
      JOIN school_members sm ON sm.school_id = cr.school_id
      WHERE cr.id = custom_role_permissions.custom_role_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('super_admin', 'principal')
        AND sm.is_active = true
    )
  );

-- ============================================================
-- UPDATED_AT TRIGGER FOR CUSTOM_ROLES
-- ============================================================

CREATE TRIGGER update_custom_roles_updated_at BEFORE UPDATE ON custom_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
