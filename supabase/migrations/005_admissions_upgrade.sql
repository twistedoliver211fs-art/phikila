-- Phikila Admissions Office Upgrade
-- Run after 004_timetable_upgrade.sql

-- ============================================================
-- STAFF REGISTRATIONS (teaching staff admission forms)
-- ============================================================

CREATE TABLE staff_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  employee_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text NOT NULL,
  tsc_number text,
  staff_type text NOT NULL DEFAULT 'teaching',
  department text,
  status text NOT NULL DEFAULT 'pending',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, employee_number)
);

CREATE INDEX idx_sr_school ON staff_registrations(school_id);

-- ============================================================
-- STAFF SUBJECT ASSIGNMENTS (what subjects a teacher can teach)
-- ============================================================

CREATE TABLE staff_subject_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_registration_id uuid NOT NULL REFERENCES staff_registrations(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, staff_registration_id, subject_id)
);

CREATE INDEX idx_ssa_school ON staff_subject_assignments(school_id);
CREATE INDEX idx_ssa_staff ON staff_subject_assignments(staff_registration_id);

-- ============================================================
-- STUDENT REGISTRATIONS (student admission forms)
-- ============================================================

CREATE TABLE student_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  admission_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text,
  class_id uuid REFERENCES classes(id),
  parent_name text,
  parent_phone text NOT NULL,
  parent_email text,
  previous_school text,
  status text NOT NULL DEFAULT 'pending',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, admission_number)
);

CREATE INDEX idx_stdr_school ON student_registrations(school_id);

-- ============================================================
-- NON-TEACHING STAFF
-- ============================================================

CREATE TABLE non_teaching_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, staff_number)
);

CREATE INDEX idx_nts_school ON non_teaching_staff(school_id);

-- ============================================================
-- MODIFY SCHOOLS: add curriculum_subjects_loaded
-- ============================================================

ALTER TABLE schools ADD COLUMN IF NOT EXISTS curriculum_subjects_loaded boolean DEFAULT false;

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE staff_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_teaching_staff ENABLE ROW LEVEL SECURITY;

-- Staff Registrations
CREATE POLICY "SR: members can view" ON staff_registrations
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "SR: admin can manage" ON staff_registrations
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'admissions_officer', 'secretary')
    )
  );

-- Staff Subject Assignments
CREATE POLICY "SSA: members can view" ON staff_subject_assignments
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "SSA: admin can manage" ON staff_subject_assignments
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'admissions_officer', 'secretary')
    )
  );

-- Student Registrations
CREATE POLICY "STR: members can view" ON student_registrations
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "STR: admin can manage" ON student_registrations
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'admissions_officer', 'secretary')
    )
  );

-- Non-Teaching Staff
CREATE POLICY "NTS: members can view" ON non_teaching_staff
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "NTS: admin can manage" ON non_teaching_staff
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'admissions_officer', 'secretary')
    )
  );
