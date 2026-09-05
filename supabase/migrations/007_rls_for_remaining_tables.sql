-- ============================================================
-- 007_rls_for_remaining_tables.sql
-- Adds Row Level Security to the 13 tables that shipped without it
-- in 001_initial_schema.sql (which only enabled RLS on 9 of the
-- 22 app tables).
--
-- All policies are scoped to school membership + role where
-- applicable, consistent with the helper functions already
-- defined in 001: get_user_school_ids() and is_super_admin().
--
-- NOTE: 007 was created by a security hardening pass. It only
-- enables RLS on tables that had NOT already been covered by 001,
-- so it is safe to re-run even if 001 is later extended.
-- ============================================================

-- --- Enable RLS on every unprotected table ---

alter table academic_years      enable row level security;
alter table classes             enable row level security;
alter table class_teachers      enable row level security;
alter table fee_structures      enable row level security;
alter table grades              enable row level security;
alter table messages            enable row level security;
alter table payments            enable row level security;
alter table periods             enable row level security;
alter table rooms               enable row level security;
alter table student_accounts    enable row level security;
alter table subjects            enable row level security;
alter table terms               enable row level security;
alter table timetable_slots     enable row level security;

-- ============================================================
-- academic_years
-- ============================================================
create policy "academic_years: members can view"
  on academic_years for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "academic_years: admin/principal can manage"
  on academic_years for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- classes
-- ============================================================
create policy "classes: members can view"
  on classes for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "classes: admin/principal can manage"
  on classes for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- class_teachers  (no school_id column — derive via classes)
-- ============================================================
create policy "class_teachers: members can view"
  on class_teachers for select
  using (
    class_teachers.class_id in (
      select c.id
      from classes c
      where c.school_id in (select get_user_school_ids())
    )
    or is_super_admin()
  );

create policy "class_teachers: admin/principal can manage"
  on class_teachers for all
  using (
    class_teachers.class_id in (
      select c.id
      from classes c
      join school_members sm on sm.school_id = c.school_id
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- fee_structures
-- ============================================================
create policy "fee_structures: members can view"
  on fee_structures for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "fee_structures: admin/principal can manage"
  on fee_structures for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- grades
-- ============================================================
create policy "grades: members can view"
  on grades for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "grades: admin/principal can manage"
  on grades for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- messages  (no school_id column; scope via sender/recipient)
-- A message is "visible" when you are the sender or recipient,
-- or you are a super admin. Sending is restricted to school
-- members contacting other school members in the same school(s).
-- ============================================================

create policy "messages: users can view own threads"
  on messages for select
  using (
    sender_id = auth.uid()
    or recipient_id = auth.uid()
    or is_super_admin()
  );

create policy "messages: school members can send"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and sender_id in (select user_id from school_members where is_active = true)
    and recipient_id in (
      select sm.user_id
      from school_members sm
      where sm.school_id in (select get_user_school_ids())
        and sm.is_active = true
    )
  );

create policy "messages: sender can update own unread"
  on messages for update
  using (
    sender_id = auth.uid()
    and not is_read
  );

create policy "messages: sender can delete own"
  on messages for delete
  using (sender_id = auth.uid());

-- ============================================================
-- payments
-- ============================================================
create policy "payments: members can view"
  on payments for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "payments: admin/finance can manage"
  on payments for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal', 'finance')
        and sm.is_active = true
    )
  );

-- ============================================================
-- periods
-- ============================================================
create policy "periods: members can view"
  on periods for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "periods: admin/principal can manage"
  on periods for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- rooms
-- ============================================================
create policy "rooms: members can view"
  on rooms for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "rooms: admin/principal can manage"
  on rooms for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- student_accounts  (no school_id column; derive via students)
-- ============================================================
create policy "student_accounts: members can view"
  on student_accounts for select
  using (
    student_accounts.student_id in (
      select s.id
      from students s
      where s.school_id in (select get_user_school_ids())
    )
    or is_super_admin()
  );

create policy "student_accounts: admin/principal can manage"
  on student_accounts for all
  using (
    student_accounts.student_id in (
      select s.id
      from students s
      join school_members sm on sm.school_id = s.school_id
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- subjects
-- ============================================================
create policy "subjects: members can view"
  on subjects for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "subjects: admin/principal can manage"
  on subjects for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- terms
-- ============================================================
create policy "terms: members can view"
  on terms for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "terms: admin/principal can manage"
  on terms for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal')
        and sm.is_active = true
    )
  );

-- ============================================================
-- timetable_slots
-- ============================================================
create policy "timetable_slots: members can view"
  on timetable_slots for select
  using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "timetable_slots: admin/principal/timetable_manager can manage"
  on timetable_slots for all
  using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid()
        and sm.role in ('super_admin', 'principal', 'timetable_manager')
        and sm.is_active = true
    )
  );
