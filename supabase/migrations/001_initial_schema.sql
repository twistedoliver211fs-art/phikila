-- Phikila Multi-School Management System
-- Initial database schema

-- Uses PostgreSQL built-in gen_random_uuid() for UUIDs

-- ============================================================
-- ENUMS
-- ============================================================

create type school_status as enum ('pending', 'approved', 'active', 'suspended', 'archived');
create type school_type as enum ('public', 'private', 'international', 'other');
create type education_level as enum ('junior', 'senior', 'junior_senior');
create type member_role as enum ('super_admin', 'principal', 'teacher', 'finance', 'admissions_officer', 'secretary', 'parent');
create type attendance_status as enum ('present', 'absent', 'late', 'excused');
create type admission_status as enum ('pending', 'under_review', 'accepted', 'rejected', 'enrolled');
create type subscription_status as enum ('trial', 'active', 'past_due', 'cancelled');
create type gender as enum ('male', 'female', 'other');

-- ============================================================
-- SCHOOLS
-- ============================================================

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  school_type school_type not null default 'private',
  education_level education_level not null default 'junior_senior',
  country text not null default 'KE',
  address text,
  phone text,
  email text,
  website text,
  staff_count integer,
  logo_url text,
  status school_status not null default 'pending',
  subscription_status subscription_status not null default 'trial',
  onboarding_progress integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_schools_slug on schools(slug);
create index idx_schools_status on schools(status);

-- ============================================================
-- SCHOOL MEMBERS (users + roles per school)
-- ============================================================

create table school_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  role member_role not null default 'teacher',
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  unique(user_id, school_id, role)
);

create index idx_school_members_user on school_members(user_id);
create index idx_school_members_school on school_members(school_id);
create index idx_school_members_role on school_members(role);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ACADEMIC STRUCTURE
-- ============================================================

create table academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean default false,
  created_at timestamptz not null default now()
);

create table terms (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean default false,
  created_at timestamptz not null default now()
);

create table grades (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  level integer,
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  grade_id uuid not null references grades(id) on delete cascade,
  name text not null,
  stream text,
  capacity integer default 40,
  created_at timestamptz not null default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- STUDENTS
-- ============================================================

create table students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  admission_number text not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender gender,
  class_id uuid references classes(id),
  parent_user_id uuid references auth.users(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(school_id, admission_number)
);

create index idx_students_school on students(school_id);
create index idx_students_class on students(class_id);
create index idx_students_parent on students(parent_user_id);

-- ============================================================
-- STAFF
-- ============================================================

create table staff (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  user_id uuid references auth.users(id),
  employee_number text,
  first_name text not null,
  last_name text not null,
  role member_role not null default 'teacher',
  department text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(school_id, employee_number)
);

create index idx_staff_school on staff(school_id);
create index idx_staff_user on staff(user_id);

-- ============================================================
-- CLASS TEACHERS (assignment)
-- ============================================================

create table class_teachers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  staff_id uuid not null references staff(id) on delete cascade,
  subject_id uuid references subjects(id),
  unique(class_id, staff_id, subject_id)
);

-- ============================================================
-- ATTENDANCE
-- ============================================================

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  status attendance_status not null default 'present',
  recorded_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  unique(student_id, date)
);

create index idx_attendance_school_date on attendance_records(school_id, date);
create index idx_attendance_student on attendance_records(student_id);

-- ============================================================
-- FEES
-- ============================================================

create table fee_structures (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  amount decimal(10,2) not null,
  academic_year_id uuid references academic_years(id),
  created_at timestamptz not null default now()
);

create table student_accounts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id),
  amount_due decimal(10,2) not null default 0,
  amount_paid decimal(10,2) not null default 0,
  balance decimal(10,2) generated always as (amount_due - amount_paid) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_account_id uuid not null references student_accounts(id) on delete cascade,
  amount decimal(10,2) not null,
  payment_date date not null default current_date,
  reference_number text,
  recorded_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ADMISSIONS
-- ============================================================

create table admissions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  applicant_name text not null,
  applicant_email text,
  applicant_phone text,
  date_of_birth date,
  gender gender,
  requested_class_id uuid references classes(id),
  status admission_status not null default 'pending',
  notes text,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_admissions_school on admissions(school_id);
create index idx_admissions_status on admissions(status);

-- ============================================================
-- COMMUNICATION
-- ============================================================

create table announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  title text not null,
  content text not null,
  author_id uuid references auth.users(id),
  target_roles member_role[],
  is_published boolean default true,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  recipient_id uuid references auth.users(id),
  subject text,
  content text not null,
  is_read boolean default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TIMETABLE
-- ============================================================

create table rooms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  capacity integer,
  created_at timestamptz not null default now()
);

create table periods (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  position integer not null,
  created_at timestamptz not null default now()
);

create table timetable_slots (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id),
  staff_id uuid not null references staff(id),
  room_id uuid references rooms(id),
  period_id uuid not null references periods(id),
  day_of_week integer not null check (day_of_week between 0 and 6),
  term_id uuid references terms(id),
  is_published boolean default false,
  created_at timestamptz not null default now()
);

create index idx_timetable_school on timetable_slots(school_id);
create index idx_timetable_class on timetable_slots(class_id);
create index idx_timetable_staff on timetable_slots(staff_id);
create index idx_timetable_day on timetable_slots(day_of_week);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  title text not null,
  message text not null,
  type text,
  is_read boolean default false,
  deep_link text,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table schools enable row level security;
alter table school_members enable row level security;
alter table profiles enable row level security;
alter table students enable row level security;
alter table staff enable row level security;
alter table attendance_records enable row level security;
alter table admissions enable row level security;
alter table announcements enable row level security;
alter table notifications enable row level security;

-- Helper: get current user's school IDs
create or replace function get_user_school_ids()
returns setof uuid as $$
  select school_id from school_members where user_id = auth.uid() and is_active = true;
$$ language sql stable security definer;

-- Helper: check if user is super_admin
create or replace function is_super_admin()
returns boolean as $$
  select exists (
    select 1 from school_members where user_id = auth.uid() and role = 'super_admin' and is_active = true
  );
$$ language sql stable security definer;

-- Schools: members can read their schools, super admins can do everything
create policy "Schools: members can view" on schools
  for select using (id in (select get_user_school_ids()) or is_super_admin());

create policy "Schools: super admin can insert" on schools
  for insert with check (is_super_admin());

create policy "Schools: super admin can update" on schools
  for update using (is_super_admin());

-- School Members
create policy "Members: view own school members" on school_members
  for select using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "Members: super admin can manage" on school_members
  for all using (is_super_admin());

-- Profiles
create policy "Profiles: users can view own" on profiles
  for select using (id = auth.uid());

create policy "Profiles: members can view school members" on profiles
  for select using (
    id in (
      select sm.user_id from school_members sm
      where sm.school_id in (select get_user_school_ids())
    ) or is_super_admin()
  );

create policy "Profiles: users can update own" on profiles
  for update using (id = auth.uid());

-- Students
create policy "Students: members can view" on students
  for select using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "Students: admin/principal can manage" on students
  for all using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid() and sm.role in ('super_admin', 'principal')
    )
  );

-- Staff
create policy "Staff: members can view" on staff
  for select using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "Staff: admin/principal can manage" on staff
  for all using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid() and sm.role in ('super_admin', 'principal')
    )
  );

-- Attendance
create policy "Attendance: members can view" on attendance_records
  for select using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "Attendance: teachers can record" on attendance_records
  for insert with check (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid() and sm.role in ('teacher', 'principal', 'super_admin')
    )
  );

-- Admissions
create policy "Admissions: members can view" on admissions
  for select using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "Admissions: admin can manage" on admissions
  for all using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid() and sm.role in ('super_admin', 'principal', 'admissions_officer')
    )
  );

-- Announcements
create policy "Announcements: members can view" on announcements
  for select using (school_id in (select get_user_school_ids()) or is_super_admin());

create policy "Announcements: admin can manage" on announcements
  for all using (
    school_id in (
      select sm.school_id from school_members sm
      where sm.user_id = auth.uid() and sm.role in ('super_admin', 'principal')
    )
  );

-- Notifications
create policy "Notifications: users can view own" on notifications
  for select using (user_id = auth.uid());

create policy "Notifications: users can update own" on notifications
  for update using (user_id = auth.uid());

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_schools_updated_at before update on schools
  for each row execute function update_updated_at();

create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger update_students_updated_at before update on students
  for each row execute function update_updated_at();

create trigger update_staff_updated_at before update on staff
  for each row execute function update_updated_at();

create trigger update_student_accounts_updated_at before update on student_accounts
  for each row execute function update_updated_at();

create trigger update_admissions_updated_at before update on admissions
  for each row execute function update_updated_at();
