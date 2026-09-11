-- Migration 018: Parent Portal & Report Cards
-- Parent-student linking, report card generation, analytics views

-- ============================================================
-- PARENT-STUDENT RELATIONSHIPS
-- ============================================================

CREATE TABLE parent_student_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'parent',
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, student_id)
);

CREATE INDEX idx_parent_student_parent ON parent_student_relationships(parent_user_id);
CREATE INDEX idx_parent_student_student ON parent_student_relationships(student_id);

-- ============================================================
-- REPORT CARDS
-- ============================================================

CREATE TABLE report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id),
  class_id uuid NOT NULL REFERENCES classes(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  term_id uuid NOT NULL REFERENCES terms(id),
  total_score decimal(8,2) NOT NULL DEFAULT 0,
  average_score decimal(8,2) NOT NULL DEFAULT 0,
  class_rank integer,
  class_size integer,
  overall_grade text,
  remarks text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id),
  UNIQUE(student_id, exam_id)
);

CREATE INDEX idx_report_cards_school ON report_cards(school_id);
CREATE INDEX idx_report_cards_student ON report_cards(student_id);
CREATE INDEX idx_report_cards_exam ON report_cards(exam_id);
CREATE INDEX idx_report_cards_academic ON report_cards(academic_year_id, term_id);

-- ============================================================
-- ANALYTICS SNAPSHOTS (for dashboard)
-- ============================================================

CREATE TABLE analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  snapshot_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_school ON analytics_snapshots(school_id);
CREATE INDEX idx_analytics_type ON analytics_snapshots(snapshot_type);
CREATE INDEX idx_analytics_period ON analytics_snapshots(period_start, period_end);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE parent_student_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Parent-student: parents see own children, admin manages
CREATE POLICY "Parent-student: parents read own" ON parent_student_relationships
  FOR SELECT USING (
    parent_user_id = auth.uid() OR
    student_id IN (
      SELECT s.id FROM students s
      WHERE s.school_id IN (SELECT get_user_school_ids())
    ) OR is_super_admin()
  );

CREATE POLICY "Parent-student: admin manage" ON parent_student_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN school_members sm ON sm.school_id = s.school_id
      WHERE s.id = parent_student_relationships.student_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('super_admin', 'principal', 'admissions_officer')
        AND sm.is_active = true
    ) OR is_super_admin()
  );

-- Report cards: school members read, admin/teacher manage
CREATE POLICY "Report cards: school read" ON report_cards
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "Report cards: admin manage" ON report_cards
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'teacher') AND sm.is_active = true
    )
  );

-- Analytics: school members read, admin manage
CREATE POLICY "Analytics: school read" ON analytics_snapshots
  FOR SELECT USING (
    school_id IN (SELECT get_user_school_ids()) OR is_super_admin()
  );

CREATE POLICY "Analytics: admin manage" ON analytics_snapshots
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal') AND sm.is_active = true
    )
  );
