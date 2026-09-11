-- Migration 017: Notification Preferences
-- User notification channel preferences and templates

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================

CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  channel text NOT NULL,
  event_type text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_id, channel, event_type)
);

CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);

-- ============================================================
-- NOTIFICATION TEMPLATES
-- ============================================================

CREATE TABLE notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  channel text NOT NULL,
  subject_template text,
  body_template text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, event_type, channel)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notif prefs: users read own" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Notif prefs: users manage own" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Notif templates: school members read" ON notification_templates
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "Notif templates: admin manage" ON notification_templates
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal') AND sm.is_active = true
    )
  );
