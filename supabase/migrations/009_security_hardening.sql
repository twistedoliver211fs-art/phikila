-- ============================================================
-- 009_security_hardening.sql
-- Least-privilege RLS, safe SECURITY DEFINER helpers, and
-- removal of the self-registration privilege-escalation policies.
-- ============================================================

-- --- Helpers: pin search_path to block search-path hijacking ---

create or replace function public.get_user_school_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id
  from public.school_members
  where user_id = auth.uid()
    and is_active = true;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.school_members
    where user_id = auth.uid()
      and role = 'super_admin'
      and is_active = true
  );
$$;

create or replace function public.has_school_role(p_school_id uuid, p_roles public.member_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.school_members
      where user_id = auth.uid()
        and school_id = p_school_id
        and is_active = true
        and role = any (p_roles)
    );
$$;

revoke all on function public.get_user_school_ids() from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.has_school_role(uuid, public.member_role[]) from public;

grant execute on function public.get_user_school_ids() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.has_school_role(uuid, public.member_role[]) to authenticated;

-- --- Close self-registration holes from 008 ---
-- School + principal inserts go through the service-role API route.

drop policy if exists "Schools: authenticated users can register new schools" on public.schools;
drop policy if exists "Schools: new owners can add themselves as principal" on public.school_members;
drop policy if exists "Schools: super admin can update all" on public.schools;
drop policy if exists "Members: principals can manage their school members" on public.school_members;
drop policy if exists "Members: super admin can delete" on public.school_members;
drop policy if exists "Members: principals can remove their school members" on public.school_members;

create policy "Members: principals can update school members"
  on public.school_members
  for update
  using (
    public.has_school_role(school_id, array['principal']::public.member_role[])
    and role <> 'super_admin'
  )
  with check (
    public.has_school_role(school_id, array['principal']::public.member_role[])
    and role <> 'super_admin'
  );

create policy "Members: principals can delete school members"
  on public.school_members
  for delete
  using (
    public.has_school_role(school_id, array['principal']::public.member_role[])
    and role <> 'super_admin'
  );

-- ============================================================
-- students
-- ============================================================

drop policy if exists "Students: members can view" on public.students;
drop policy if exists "Students: admin/principal can manage" on public.students;

create policy "Students: staff can view school students"
  on public.students
  for select
  using (
    public.has_school_role(
      school_id,
      array['principal', 'teacher', 'timetable_manager', 'finance', 'admissions_officer', 'secretary']::public.member_role[]
    )
  );

create policy "Students: parents can view own children"
  on public.students
  for select
  using (parent_user_id = auth.uid());

create policy "Students: leadership can manage"
  on public.students
  for all
  using (
    public.has_school_role(
      school_id,
      array['principal', 'admissions_officer']::public.member_role[]
    )
  )
  with check (
    public.has_school_role(
      school_id,
      array['principal', 'admissions_officer']::public.member_role[]
    )
  );

-- ============================================================
-- attendance_records
-- ============================================================

drop policy if exists "Attendance: members can view" on public.attendance_records;
drop policy if exists "Attendance: teachers can record" on public.attendance_records;

create policy "Attendance: staff can view"
  on public.attendance_records
  for select
  using (
    public.has_school_role(
      school_id,
      array['principal', 'teacher', 'timetable_manager', 'admissions_officer', 'secretary']::public.member_role[]
    )
  );

create policy "Attendance: parents can view own children"
  on public.attendance_records
  for select
  using (
    student_id in (select id from public.students where parent_user_id = auth.uid())
  );

create policy "Attendance: teachers can insert"
  on public.attendance_records
  for insert
  with check (
    public.has_school_role(
      school_id,
      array['teacher', 'timetable_manager', 'principal']::public.member_role[]
    )
  );

create policy "Attendance: teachers can update"
  on public.attendance_records
  for update
  using (
    public.has_school_role(
      school_id,
      array['teacher', 'timetable_manager', 'principal']::public.member_role[]
    )
  )
  with check (
    public.has_school_role(
      school_id,
      array['teacher', 'timetable_manager', 'principal']::public.member_role[]
    )
  );

-- ============================================================
-- payments / student_accounts / fee_structures
-- ============================================================

drop policy if exists "payments: members can view" on public.payments;
drop policy if exists "student_accounts: members can view" on public.student_accounts;
drop policy if exists "fee_structures: admin/principal can manage" on public.fee_structures;

create policy "payments: finance staff can view"
  on public.payments
  for select
  using (
    public.has_school_role(school_id, array['principal', 'finance']::public.member_role[])
  );

create policy "payments: parents can view own children"
  on public.payments
  for select
  using (
    student_account_id in (
      select sa.id
      from public.student_accounts sa
      join public.students s on s.id = sa.student_id
      where s.parent_user_id = auth.uid()
    )
  );

create policy "student_accounts: finance staff can view"
  on public.student_accounts
  for select
  using (
    public.has_school_role(school_id, array['principal', 'finance', 'admissions_officer']::public.member_role[])
  );

create policy "student_accounts: parents can view own children"
  on public.student_accounts
  for select
  using (
    student_id in (select id from public.students where parent_user_id = auth.uid())
  );

create policy "fee_structures: finance can manage"
  on public.fee_structures
  for all
  using (
    public.has_school_role(school_id, array['principal', 'finance']::public.member_role[])
  )
  with check (
    public.has_school_role(school_id, array['principal', 'finance']::public.member_role[])
  );

-- ============================================================
-- exam_results — teachers may insert/update, not delete school-wide
-- ============================================================

drop policy if exists "Exam Results: members can view" on public.exam_results;
drop policy if exists "Exam Results: teachers can record" on public.exam_results;

create policy "Exam Results: staff can view"
  on public.exam_results
  for select
  using (
    exam_id in (
      select e.id
      from public.exams e
      where public.has_school_role(
        e.school_id,
        array['principal', 'teacher', 'timetable_manager', 'admissions_officer']::public.member_role[]
      )
    )
  );

create policy "Exam Results: parents can view own children"
  on public.exam_results
  for select
  using (
    student_id in (select id from public.students where parent_user_id = auth.uid())
  );

create policy "Exam Results: teachers can insert"
  on public.exam_results
  for insert
  with check (
    exam_id in (
      select e.id
      from public.exams e
      where public.has_school_role(
        e.school_id,
        array['teacher', 'timetable_manager', 'principal']::public.member_role[]
      )
    )
  );

create policy "Exam Results: teachers can update"
  on public.exam_results
  for update
  using (
    exam_id in (
      select e.id
      from public.exams e
      where public.has_school_role(
        e.school_id,
        array['teacher', 'timetable_manager', 'principal']::public.member_role[]
      )
    )
  )
  with check (
    exam_id in (
      select e.id
      from public.exams e
      where public.has_school_role(
        e.school_id,
        array['teacher', 'timetable_manager', 'principal']::public.member_role[]
      )
    )
  );
