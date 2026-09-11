-- ============================================================
-- 023: Offline sync conflict detection
--
-- Adds updated_at to the two tables written by offline sync so the
-- server can compare timestamps instead of silently overwriting
-- (last-write-wins). attendance_records also gains class_id, which the
-- offline client records carry but the table never had.
-- ============================================================
create extension if not exists moddatetime;

alter table attendance_records add column if not exists class_id uuid references classes(id) on delete set null;
alter table attendance_records add column if not exists updated_at timestamptz not null default now();
alter table exam_results add column if not exists updated_at timestamptz not null default now();

-- Server writes (online saves) must bump updated_at.
drop trigger if exists trg_attendance_records_updated_at on attendance_records;
create trigger trg_attendance_records_updated_at
  before update on attendance_records
  for each row execute function moddatetime(updated_at);

drop trigger if exists trg_exam_results_updated_at on exam_results;
create trigger trg_exam_results_updated_at
  before update on exam_results
  for each row execute function moddatetime(updated_at);

-- Index supporting conflict lookups by the natural keys.
create index if not exists idx_attendance_student_date on attendance_records(student_id, date);
create index if not exists idx_exam_results_unique_key on exam_results(exam_id, student_id, subject_id);
