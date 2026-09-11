-- Migration 013: Feature Flags
-- Platform and school-level feature toggles

-- ============================================================
-- FEATURE FLAGS (platform-wide)
-- ============================================================

CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  scope text NOT NULL DEFAULT 'platform', -- 'platform' or 'school'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SCHOOL FEATURE FLAGS (per-school overrides)
-- ============================================================

CREATE TABLE school_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  feature_flag_id uuid NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, feature_flag_id)
);

CREATE INDEX idx_school_feature_flags_school ON school_feature_flags(school_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_feature_flags ENABLE ROW LEVEL SECURITY;

-- Feature flags: readable by everyone, managed by super_admin
CREATE POLICY "Feature flags: public read" ON feature_flags
  FOR SELECT USING (true);

CREATE POLICY "Feature flags: super admin manage" ON feature_flags
  FOR ALL USING (is_super_admin());

-- School feature flags: school members can view, super_admin manages
CREATE POLICY "School flags: school members read" ON school_feature_flags
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "School flags: super admin manage" ON school_feature_flags
  FOR ALL USING (is_super_admin());

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED FEATURE FLAGS
-- ============================================================

INSERT INTO feature_flags (key, name, description, scope) VALUES
  ('ai_assistant', 'AI Assistant', 'AI-powered school insights and recommendations', 'school'),
  ('whatsapp', 'WhatsApp Integration', 'Send notifications via WhatsApp', 'school'),
  ('sms_notifications', 'SMS Notifications', 'Send notifications via SMS', 'school'),
  ('email_notifications', 'Email Notifications', 'Send notifications via email', 'school'),
  ('advanced_reports', 'Advanced Reports', 'Detailed analytics and report generation', 'school'),
  ('api_access', 'API Access', 'REST API for external integrations', 'school'),
  ('website_builder', 'School Website Builder', 'Build a public school website', 'school'),
  ('automation', 'Workflow Automation', 'Automated workflows and triggers', 'school'),
  ('custom_roles', 'Custom Roles', 'Define custom roles with granular permissions', 'school'),
  ('document_management', 'Document Management', 'Upload and manage school documents', 'school'),
  ('digital_signatures', 'Digital Signatures', 'Sign documents digitally', 'school'),
  ('batch_operations', 'Batch Operations', 'Bulk import/export data', 'school')
ON CONFLICT (key) DO NOTHING;
