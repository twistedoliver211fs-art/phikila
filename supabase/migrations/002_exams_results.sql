-- Phikila: Exams & Results system
-- Run after 001_initial_schema.sql

-- ============================================================
-- EXAMS
-- ============================================================

create table exams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  term_id uuid references terms(id),
  exam_date date,
  created_at timestamptz not null default now()
);

create index idx_exams_school on exams(school_id);

-- ============================================================
-- EXAM RESULTS
-- ============================================================

create table exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id),
  score decimal(5,2) not null check (score >= 0 and score <= 100),
  grade text,
  remarks text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(exam_id, student_id, subject_id)
);

create index idx_exam_results_exam on exam_results(exam_id);
create index idx_exam_results_student on exam_results(student_id);

-- ============================================================
-- RLS
-- ============================================================

alter table exams enable row level security;
alter table exam_results enable row level security;

create policy "Exams: members can view" on exams
  for select using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "Exams: admin can manage" on exams
  for all using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid() and sm.role in ('super_admin', 'principal')
    )
  );

create policy "Exam Results: members can view" on exam_results
  for select using (
    exam_id in (
      select e.id from exams e
      where e.school_id in (select get_user_school_ids()) or is_super_admin()
    )
  );

create policy "Exam Results: teachers can record" on exam_results
  for all using (
    exam_id in (
      select e.id from exams e
      where e.school_id in (
        select sm.school_id from school_members sm
        where sm.user_id = auth.uid() and sm.role in ('teacher', 'principal', 'super_admin')
      )
    )
  );
