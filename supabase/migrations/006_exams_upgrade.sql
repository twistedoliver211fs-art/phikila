-- Phikila Exams System Upgrade
-- Run after 005_admissions_upgrade.sql

-- ============================================================
-- GRADING SYSTEMS (configurable per school/term)
-- ============================================================

CREATE TABLE grading_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  term_id uuid REFERENCES terms(id),
  grade_label text NOT NULL,
  min_score numeric NOT NULL CHECK (min_score >= 0 AND min_score <= 100),
  max_score numeric NOT NULL CHECK (max_score >= 0 AND max_score <= 100),
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, term_id, grade_label)
);

CREATE INDEX idx_gs_school ON grading_systems(school_id);

-- ============================================================
-- EXAM INSIGHTS (auto-generated performance insights)
-- ============================================================

CREATE TABLE exam_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  insight_text text NOT NULL,
  metric_value numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ei_school ON exam_insights(school_id);
CREATE INDEX idx_ei_exam ON exam_insights(exam_id);

-- ============================================================
-- MODIFY EXAMS: add exam_type, total_marks
-- ============================================================

ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_type text DEFAULT 'termly';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS total_marks integer DEFAULT 100;

-- ============================================================
-- MODIFY EXAM_RESULTS: add percentage for faster queries
-- ============================================================

ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS percentage numeric;

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE grading_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_insights ENABLE ROW LEVEL SECURITY;

-- Grading Systems
CREATE POLICY "GS: members can view" ON grading_systems
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "GS: admin can manage" ON grading_systems
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'admissions_officer')
    )
  );

-- Exam Insights
CREATE POLICY "EI: members can view" ON exam_insights
  FOR SELECT USING (school_id IN (select get_user_school_ids()) OR is_super_admin());

CREATE POLICY "EI: admin can manage" ON exam_insights
  FOR ALL USING (
    school_id IN (
      SELECT sm.school_id FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.role IN ('super_admin', 'principal', 'admissions_officer')
    )
  );
