-- Phikila Timetable System Upgrade
-- Run after 001_initial_schema.sql, 002_exams_results.sql, 003_timetable_manager.sql

-- ============================================================
-- TEACHER-SUBJECT-CLASS ASSIGNMENTS
-- ============================================================

CREATE TABLE teacher_subject_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, staff_id, subject_id, class_id)
);

CREATE INDEX idx_tsa_school ON teacher_subject_assignments(school_id);
CREATE INDEX idx_tsa_staff ON teacher_subject_assignments(staff_id);
CREATE INDEX idx_tsa_class ON teacher_subject_assignments(class_id);

-- ============================================================
-- SUBJECT FREQUENCIES (periods per week per grade)
-- ============================================================

CREATE TABLE subject_frequencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  periods_per_week integer NOT NULL CHECK (periods_per_week > 0 AND periods_per_week <= 10),
  term_id uuid REFERENCES terms(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, subject_id, grade_id, term_id)
);

CREATE INDEX idx_sf_school ON subject_frequencies(school_id);

-- ============================================================
-- BREAKS (non-teaching periods)
-- ============================================================

CREATE TABLE breaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_type text NOT NULL DEFAULT 'break',
  days integer[] DEFAULT '{1,2,3,4,5}',
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_breaks_school ON breaks(school_id);

-- ============================================================
-- TIMETABLE SETTINGS (motto, note, colors)
-- ============================================================

CREATE TABLE timetable_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE UNIQUE,
  school_motto text DEFAULT '',
  note text DEFAULT '',
  auto_assign_colors boolean DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SUBJECT COLORS
-- ============================================================

CREATE TABLE subject_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, subject_id)
);

CREATE INDEX idx_sc_school ON subject_colors(school_id);

-- ============================================================
-- MODIFY ROOMS: add room_type
-- ============================================================

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type text DEFAULT 'standard';

-- ============================================================
-- MODIFY SUBJECTS: add required_room_type
-- ============================================================

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS required_room_type text DEFAULT NULL;

-- ============================================================
-- MODIFY TIMETABLE_SLOTS: add unique constraint
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_class_period_day'
  ) THEN
    ALTER TABLE timetable_slots
      ADD CONSTRAINT unique_class_period_day
      UNIQUE (class_id, period_id, day_of_week, term_id);
  END IF;
END $$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE teacher_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_colors ENABLE ROW LEVEL SECURITY;

-- Teacher Subject Assignments
CREATE POLICY "TSA: members can view" ON teacher_subject_assignments
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "TSA: admin can manage" ON teacher_subject_assignments
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'timetable_manager')
    )
  );

-- Subject Frequencies
CREATE POLICY "SF: members can view" ON subject_frequencies
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "SF: admin can manage" ON subject_frequencies
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'timetable_manager')
    )
  );

-- Breaks
CREATE POLICY "Breaks: members can view" ON breaks
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Breaks: admin can manage" ON breaks
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'timetable_manager')
    )
  );

-- Timetable Settings
CREATE POLICY "Settings: members can view" ON timetable_settings
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Settings: admin can manage" ON timetable_settings
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'timetable_manager')
    )
  );

-- Subject Colors
CREATE POLICY "Colors: members can view" ON subject_colors
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "Colors: admin can manage" ON subject_colors
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'timetable_manager')
    )
  );
