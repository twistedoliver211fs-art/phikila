-- =============================================================================
-- Decimal Demo Seed: Green Valley Academy
-- =============================================================================
-- Run this AFTER creating a super admin user in Supabase Auth.
-- Replace SUPER_ADMIN_USER_ID below with the actual auth.users UUID.
--
-- This script is idempotent — safe to re-run (uses ON CONFLICT DO NOTHING).
-- =============================================================================

DO $$
DECLARE
  SUPER_ADMIN_USER_ID UUID := '00000000-0000-0000-0000-000000000001';

  school_id UUID := '11111111-1111-1111-1111-111111111111';
  year_id UUID := '22222222-2222-2222-2222-222222222222';
  term1_id UUID := '33333333-0001-0000-0000-000000000000';
  term2_id UUID := '33333333-0002-0000-0000-000000000000';
  term3_id UUID := '33333333-0003-0000-0000-000000000000';

  g1_id UUID; g2_id UUID; g3_id UUID; g4_id UUID; g5_id UUID;
  g6_id UUID; g7_id UUID; g8_id UUID; g9_id UUID;
  g10_id UUID; g11_id UUID; g12_id UUID;

  c1a_id UUID; c1b_id UUID; c2a_id UUID; c2b_id UUID;
  c3a_id UUID; c3b_id UUID; c4a_id UUID; c4b_id UUID;
  c5a_id UUID; c5b_id UUID; c6a_id UUID; c6b_id UUID;
  c7a_id UUID; c7b_id UUID; c8a_id UUID; c8b_id UUID;
  c9a_id UUID; c9b_id UUID; c10a_id UUID; c11a_id UUID; c12a_id UUID;

  subj_math UUID; subj_eng UUID; subj_kisw UUID; subj_sci UUID; subj_sst UUID;
  subj_pe UUID; subj_art UUID; subj_comp UUID; subj_music UUID; subj_hsc UUID;
  subj_phy UUID; subj_chem UUID; subj_bio UUID; subj_hist UUID; subj_geo UUID;
  subj_biz UUID; subj_cs UUID;

  staff_principal UUID;
  t1 UUID; t2 UUID; t3 UUID; t4 UUID; t5 UUID;
  t6 UUID; t7 UUID; t8 UUID; t9 UUID; t10 UUID;
  t11 UUID; t12 UUID; t13 UUID; t14 UUID; t15 UUID;

  room_101 UUID; room_102 UUID; room_201 UUID; room_202 UUID;
  room_lab UUID; room_comp UUID; room_music UUID; room_lib UUID;

  p1_id UUID; p2_id UUID; p3_id UUID; p4_id UUID;
  p5_id UUID; p6_id UUID; p7_id UUID; p8_id UUID;

  fs_tuition UUID; fs_activities UUID; fs_library UUID; fs_computer UUID;
  exam_midterm UUID;

  s_ids UUID[100];
  a_ids UUID[100];
  i INT;
BEGIN

-- =============================================================================
-- 1. SCHOOL
-- =============================================================================
INSERT INTO schools (id, name, slug, school_type, education_level, country, address, phone, email, website, staff_count, status, subscription_status)
VALUES (
  school_id, 'Green Valley Academy', 'green-valley-academy',
  'private', 'junior_senior', 'KE',
  'Ngong Road, Karen, Nairobi, Kenya', '+254 722 123 456',
  'info@greenvalleyacademy.ke', 'https://greenvalleyacademy.ke',
  19, 'active', 'active'
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 2. SCHOOL MEMBERS + PROFILES
-- =============================================================================
INSERT INTO profiles (id, full_name, phone) VALUES
  (SUPER_ADMIN_USER_ID, 'System Administrator', '+254 700 000 001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO school_members (user_id, school_id, role, is_active) VALUES
  (SUPER_ADMIN_USER_ID, school_id, 'super_admin', true)
ON CONFLICT (user_id, school_id, role) DO NOTHING;

-- =============================================================================
-- 3. ACADEMIC YEAR & TERMS
-- =============================================================================
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current)
VALUES (year_id, school_id, '2026', '2026-01-05', '2026-12-04', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terms (id, academic_year_id, name, start_date, end_date, is_current) VALUES
  (term1_id, year_id, 'Term 1', '2026-01-05', '2026-04-02', true),
  (term2_id, year_id, 'Term 2', '2026-04-27', '2026-07-31', false),
  (term3_id, year_id, 'Term 3', '2026-08-24', '2026-12-04', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. GRADES & CLASSES
-- =============================================================================
INSERT INTO grades (id, school_id, name, level) VALUES
  ('aaaa0001-0000-0000-0000-000000000000', school_id, 'Grade 1', 1),
  ('aaaa0002-0000-0000-0000-000000000000', school_id, 'Grade 2', 2),
  ('aaaa0003-0000-0000-0000-000000000000', school_id, 'Grade 3', 3),
  ('aaaa0004-0000-0000-0000-000000000000', school_id, 'Grade 4', 4),
  ('aaaa0005-0000-0000-0000-000000000000', school_id, 'Grade 5', 5),
  ('aaaa0006-0000-0000-0000-000000000000', school_id, 'Grade 6', 6),
  ('aaaa0007-0000-0000-0000-000000000000', school_id, 'Grade 7', 7),
  ('aaaa0008-0000-0000-0000-000000000000', school_id, 'Grade 8', 8),
  ('aaaa0009-0000-0000-0000-000000000000', school_id, 'Grade 9', 9),
  ('aaaa0010-0000-0000-0000-000000000000', school_id, 'Grade 10', 10),
  ('aaaa0011-0000-0000-0000-000000000000', school_id, 'Grade 11', 11),
  ('aaaa0012-0000-0000-0000-000000000000', school_id, 'Grade 12', 12)
ON CONFLICT (id) DO NOTHING;

SELECT id INTO g1_id FROM grades WHERE school_id = school_id AND name = 'Grade 1';
SELECT id INTO g2_id FROM grades WHERE school_id = school_id AND name = 'Grade 2';
SELECT id INTO g3_id FROM grades WHERE school_id = school_id AND name = 'Grade 3';
SELECT id INTO g4_id FROM grades WHERE school_id = school_id AND name = 'Grade 4';
SELECT id INTO g5_id FROM grades WHERE school_id = school_id AND name = 'Grade 5';
SELECT id INTO g6_id FROM grades WHERE school_id = school_id AND name = 'Grade 6';
SELECT id INTO g7_id FROM grades WHERE school_id = school_id AND name = 'Grade 7';
SELECT id INTO g8_id FROM grades WHERE school_id = school_id AND name = 'Grade 8';
SELECT id INTO g9_id FROM grades WHERE school_id = school_id AND name = 'Grade 9';
SELECT id INTO g10_id FROM grades WHERE school_id = school_id AND name = 'Grade 10';
SELECT id INTO g11_id FROM grades WHERE school_id = school_id AND name = 'Grade 11';
SELECT id INTO g12_id FROM grades WHERE school_id = school_id AND name = 'Grade 12';

INSERT INTO classes (id, school_id, grade_id, name, stream, capacity) VALUES
  ('bbbb0001-0000-0000-0000-000000000000', school_id, g1_id, 'Grade 1A', 'A', 42),
  ('bbbb0002-0000-0000-0000-000000000000', school_id, g1_id, 'Grade 1B', 'B', 42),
  ('bbbb0003-0000-0000-0000-000000000000', school_id, g2_id, 'Grade 2A', 'A', 42),
  ('bbbb0004-0000-0000-0000-000000000000', school_id, g2_id, 'Grade 2B', 'B', 42),
  ('bbbb0005-0000-0000-0000-000000000000', school_id, g3_id, 'Grade 3A', 'A', 40),
  ('bbbb0006-0000-0000-0000-000000000000', school_id, g3_id, 'Grade 3B', 'B', 40),
  ('bbbb0007-0000-0000-0000-000000000000', school_id, g4_id, 'Grade 4A', 'A', 40),
  ('bbbb0008-0000-0000-0000-000000000000', school_id, g4_id, 'Grade 4B', 'B', 40),
  ('bbbb0009-0000-0000-0000-000000000000', school_id, g5_id, 'Grade 5A', 'A', 40),
  ('bbbb0010-0000-0000-0000-000000000000', school_id, g5_id, 'Grade 5B', 'B', 40),
  ('bbbb0011-0000-0000-0000-000000000000', school_id, g6_id, 'Grade 6A', 'A', 38),
  ('bbbb0012-0000-0000-0000-000000000000', school_id, g6_id, 'Grade 6B', 'B', 38),
  ('bbbb0013-0000-0000-0000-000000000000', school_id, g7_id, 'Grade 7A', 'A', 38),
  ('bbbb0014-0000-0000-0000-000000000000', school_id, g7_id, 'Grade 7B', 'B', 38),
  ('bbbb0015-0000-0000-0000-000000000000', school_id, g8_id, 'Grade 8A', 'A', 36),
  ('bbbb0016-0000-0000-0000-000000000000', school_id, g8_id, 'Grade 8B', 'B', 36),
  ('bbbb0017-0000-0000-0000-000000000000', school_id, g9_id, 'Grade 9A', 'A', 36),
  ('bbbb0018-0000-0000-0000-000000000000', school_id, g9_id, 'Grade 9B', 'B', 36),
  ('bbbb0019-0000-0000-0000-000000000000', school_id, g10_id, 'Grade 10A', 'A', 32),
  ('bbbb0020-0000-0000-0000-000000000000', school_id, g11_id, 'Grade 11A', 'A', 30),
  ('bbbb0021-0000-0000-0000-000000000000', school_id, g12_id, 'Grade 12A', 'A', 28)
ON CONFLICT (id) DO NOTHING;

SELECT id INTO c1a_id FROM classes WHERE school_id = school_id AND name = 'Grade 1A';
SELECT id INTO c1b_id FROM classes WHERE school_id = school_id AND name = 'Grade 1B';
SELECT id INTO c2a_id FROM classes WHERE school_id = school_id AND name = 'Grade 2A';
SELECT id INTO c2b_id FROM classes WHERE school_id = school_id AND name = 'Grade 2B';
SELECT id INTO c3a_id FROM classes WHERE school_id = school_id AND name = 'Grade 3A';
SELECT id INTO c3b_id FROM classes WHERE school_id = school_id AND name = 'Grade 3B';
SELECT id INTO c4a_id FROM classes WHERE school_id = school_id AND name = 'Grade 4A';
SELECT id INTO c4b_id FROM classes WHERE school_id = school_id AND name = 'Grade 4B';
SELECT id INTO c5a_id FROM classes WHERE school_id = school_id AND name = 'Grade 5A';
SELECT id INTO c5b_id FROM classes WHERE school_id = school_id AND name = 'Grade 5B';
SELECT id INTO c6a_id FROM classes WHERE school_id = school_id AND name = 'Grade 6A';
SELECT id INTO c6b_id FROM classes WHERE school_id = school_id AND name = 'Grade 6B';
SELECT id INTO c7a_id FROM classes WHERE school_id = school_id AND name = 'Grade 7A';
SELECT id INTO c7b_id FROM classes WHERE school_id = school_id AND name = 'Grade 7B';
SELECT id INTO c8a_id FROM classes WHERE school_id = school_id AND name = 'Grade 8A';
SELECT id INTO c8b_id FROM classes WHERE school_id = school_id AND name = 'Grade 8B';
SELECT id INTO c9a_id FROM classes WHERE school_id = school_id AND name = 'Grade 9A';
SELECT id INTO c9b_id FROM classes WHERE school_id = school_id AND name = 'Grade 9B';
SELECT id INTO c10a_id FROM classes WHERE school_id = school_id AND name = 'Grade 10A';
SELECT id INTO c11a_id FROM classes WHERE school_id = school_id AND name = 'Grade 11A';
SELECT id INTO c12a_id FROM classes WHERE school_id = school_id AND name = 'Grade 12A';

-- =============================================================================
-- 5. SUBJECTS (CBC/CBE curriculum)
-- =============================================================================
INSERT INTO subjects (id, school_id, name, code) VALUES
  ('cccc0001-0000-0000-0000-000000000000', school_id, 'Mathematics', 'MATH'),
  ('cccc0002-0000-0000-0000-000000000000', school_id, 'English', 'ENG'),
  ('cccc0003-0000-0000-0000-000000000000', school_id, 'Kiswahili', 'KISW'),
  ('cccc0004-0000-0000-0000-000000000000', school_id, 'Science & Technology', 'SCI'),
  ('cccc0005-0000-0000-0000-000000000000', school_id, 'Social Studies', 'SST'),
  ('cccc0006-0000-0000-0000-000000000000', school_id, 'Physical Education', 'PE'),
  ('cccc0007-0000-0000-0000-000000000000', school_id, 'Art & Craft', 'ART'),
  ('cccc0008-0000-0000-0000-000000000000', school_id, 'Computer Studies', 'COMP'),
  ('cccc0009-0000-0000-0000-000000000000', school_id, 'Music', 'MUS'),
  ('cccc0010-0000-0000-0000-000000000000', school_id, 'Home Science', 'HSC'),
  ('cccc0011-0000-0000-0000-000000000000', school_id, 'Physics', 'PHY'),
  ('cccc0012-0000-0000-0000-000000000000', school_id, 'Chemistry', 'CHEM'),
  ('cccc0013-0000-0000-0000-000000000000', school_id, 'Biology', 'BIO'),
  ('cccc0014-0000-0000-0000-000000000000', school_id, 'History & Government', 'HIST'),
  ('cccc0015-0000-0000-0000-000000000000', school_id, 'Geography', 'GEO'),
  ('cccc0016-0000-0000-0000-000000000000', school_id, 'Business Studies', 'BIZ'),
  ('cccc0017-0000-0000-0000-000000000000', school_id, 'Computer Science', 'CS')
ON CONFLICT (id) DO NOTHING;

SELECT id INTO subj_math FROM subjects WHERE school_id = school_id AND name = 'Mathematics';
SELECT id INTO subj_eng FROM subjects WHERE school_id = school_id AND name = 'English';
SELECT id INTO subj_kisw FROM subjects WHERE school_id = school_id AND name = 'Kiswahili';
SELECT id INTO subj_sci FROM subjects WHERE school_id = school_id AND name = 'Science & Technology';
SELECT id INTO subj_sst FROM subjects WHERE school_id = school_id AND name = 'Social Studies';
SELECT id INTO subj_pe FROM subjects WHERE school_id = school_id AND name = 'Physical Education';
SELECT id INTO subj_art FROM subjects WHERE school_id = school_id AND name = 'Art & Craft';
SELECT id INTO subj_comp FROM subjects WHERE school_id = school_id AND name = 'Computer Studies';
SELECT id INTO subj_music FROM subjects WHERE school_id = school_id AND name = 'Music';
SELECT id INTO subj_hsc FROM subjects WHERE school_id = school_id AND name = 'Home Science';
SELECT id INTO subj_phy FROM subjects WHERE school_id = school_id AND name = 'Physics';
SELECT id INTO subj_chem FROM subjects WHERE school_id = school_id AND name = 'Chemistry';
SELECT id INTO subj_bio FROM subjects WHERE school_id = school_id AND name = 'Biology';
SELECT id INTO subj_hist FROM subjects WHERE school_id = school_id AND name = 'History & Government';
SELECT id INTO subj_geo FROM subjects WHERE school_id = school_id AND name = 'Geography';
SELECT id INTO subj_biz FROM subjects WHERE school_id = school_id AND name = 'Business Studies';
SELECT id INTO subj_cs FROM subjects WHERE school_id = school_id AND name = 'Computer Science';

-- =============================================================================
-- 6. STAFF
-- =============================================================================
INSERT INTO staff (id, school_id, employee_number, first_name, last_name, role, department, is_active) VALUES
  ('dddd0001-0000-0000-0000-000000000000', school_id, 'PRINC-001', 'Margaret', 'Wambui', 'principal', 'Administration', true),
  ('dddd0010-0000-0000-0000-000000000000', school_id, 'TEACH-001', 'James', 'Kamau', 'teacher', 'Mathematics', true),
  ('dddd0011-0000-0000-0000-000000000000', school_id, 'TEACH-002', 'Grace', 'Njeri', 'teacher', 'Mathematics', true),
  ('dddd0012-0000-0000-0000-000000000000', school_id, 'TEACH-003', 'Peter', 'Otieno', 'teacher', 'Languages', true),
  ('dddd0013-0000-0000-0000-000000000000', school_id, 'TEACH-004', 'Sarah', 'Akinyi', 'teacher', 'Languages', true),
  ('dddd0014-0000-0000-0000-000000000000', school_id, 'TEACH-005', 'David', 'Mutua', 'teacher', 'Sciences', true),
  ('dddd0015-0000-0000-0000-000000000000', school_id, 'TEACH-006', 'Fatuma', 'Hassan', 'teacher', 'Sciences', true),
  ('dddd0016-0000-0000-0000-000000000000', school_id, 'TEACH-007', 'John', 'Ochieng', 'teacher', 'Humanities', true),
  ('dddd0017-0000-0000-0000-000000000000', school_id, 'TEACH-008', 'Lucy', 'Muthoni', 'teacher', 'Humanities', true),
  ('dddd0018-0000-0000-0000-000000000000', school_id, 'TEACH-009', 'Samuel', 'Kipchoge', 'teacher', 'Physical Education', true),
  ('dddd0019-0000-0000-0000-000000000000', school_id, 'TEACH-010', 'Esther', 'Jepkoech', 'teacher', 'Creative Arts', true),
  ('dddd0020-0000-0000-0000-000000000000', school_id, 'TEACH-011', 'Michael', 'Wekesa', 'teacher', 'ICT', true),
  ('dddd0021-0000-0000-0000-000000000000', school_id, 'TEACH-012', 'Catherine', 'Auma', 'teacher', 'Languages', true),
  ('dddd0022-0000-0000-0000-000000000000', school_id, 'TEACH-013', 'Daniel', 'Kiptoo', 'teacher', 'Mathematics', true),
  ('dddd0023-0000-0000-0000-000000000000', school_id, 'TEACH-014', 'Alice', 'Wanjiru', 'teacher', 'Sciences', true),
  ('dddd0024-0000-0000-0000-000000000000', school_id, 'TEACH-015', 'Robert', 'Odhiambo', 'teacher', 'Business Studies', true),
  ('dddd0030-0000-0000-0000-000000000000', school_id, 'NONT-001', 'Joseph', 'Mwangi', 'finance', 'Finance', true),
  ('dddd0031-0000-0000-0000-000000000000', school_id, 'NONT-002', 'Anne', 'Chebet', 'admissions_officer', 'Admissions', true),
  ('dddd0032-0000-0000-0000-000000000000', school_id, 'NONT-003', 'Patricia', 'Ndegwa', 'secretary', 'Administration', true)
ON CONFLICT (school_id, employee_number) DO NOTHING;

SELECT id INTO staff_principal FROM staff WHERE school_id = school_id AND employee_number = 'PRINC-001';
SELECT id INTO t1 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-001';
SELECT id INTO t2 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-002';
SELECT id INTO t3 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-003';
SELECT id INTO t4 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-004';
SELECT id INTO t5 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-005';
SELECT id INTO t6 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-006';
SELECT id INTO t7 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-007';
SELECT id INTO t8 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-008';
SELECT id INTO t9 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-009';
SELECT id INTO t10 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-010';
SELECT id INTO t11 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-011';
SELECT id INTO t12 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-012';
SELECT id INTO t13 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-013';
SELECT id INTO t14 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-014';
SELECT id INTO t15 FROM staff WHERE school_id = school_id AND employee_number = 'TEACH-015';

-- =============================================================================
-- 7. CLASS TEACHERS (core subject assignments for key classes)
-- =============================================================================
INSERT INTO class_teachers (class_id, staff_id, subject_id) VALUES
  (c8a_id, t1, subj_math), (c8a_id, t3, subj_eng), (c8a_id, t5, subj_sci),
  (c8a_id, t12, subj_kisw), (c8a_id, t7, subj_sst),
  (c8b_id, t2, subj_math), (c8b_id, t4, subj_eng), (c8b_id, t6, subj_sci),
  (c8b_id, t13, subj_kisw), (c8b_id, t8, subj_sst),
  (c10a_id, t13, subj_math), (c10a_id, t12, subj_eng), (c10a_id, t14, subj_phy),
  (c10a_id, t6, subj_chem), (c10a_id, t5, subj_bio),
  (c11a_id, t1, subj_math), (c11a_id, t3, subj_eng), (c11a_id, t14, subj_phy),
  (c11a_id, t6, subj_chem), (c11a_id, t5, subj_bio),
  (c12a_id, t13, subj_math), (c12a_id, t4, subj_eng), (c12a_id, t14, subj_phy),
  (c12a_id, t6, subj_chem), (c12a_id, t5, subj_bio)
ON CONFLICT (class_id, staff_id, subject_id) DO NOTHING;

-- =============================================================================
-- 8. ROOMS
-- =============================================================================
INSERT INTO rooms (id, school_id, name, capacity, room_type) VALUES
  ('eeee0001-0000-0000-0000-000000000000', school_id, 'Room 101', 42, 'standard'),
  ('eeee0002-0000-0000-0000-000000000000', school_id, 'Room 102', 42, 'standard'),
  ('eeee0003-0000-0000-0000-000000000000', school_id, 'Room 201', 36, 'standard'),
  ('eeee0004-0000-0000-0000-000000000000', school_id, 'Room 202', 36, 'standard'),
  ('eeee0005-0000-0000-0000-000000000000', school_id, 'Science Lab', 32, 'laboratory'),
  ('eeee0006-0000-0000-0000-000000000000', school_id, 'Computer Lab', 30, 'computer_lab'),
  ('eeee0007-0000-0000-0000-000000000000', school_id, 'Music Room', 28, 'special'),
  ('eeee0008-0000-0000-0000-000000000000', school_id, 'Library', 50, 'library')
ON CONFLICT (id) DO NOTHING;

SELECT id INTO room_101 FROM rooms WHERE school_id = school_id AND name = 'Room 101';
SELECT id INTO room_102 FROM rooms WHERE school_id = school_id AND name = 'Room 102';
SELECT id INTO room_201 FROM rooms WHERE school_id = school_id AND name = 'Room 201';
SELECT id INTO room_202 FROM rooms WHERE school_id = school_id AND name = 'Room 202';
SELECT id INTO room_lab FROM rooms WHERE school_id = school_id AND name = 'Science Lab';
SELECT id INTO room_comp FROM rooms WHERE school_id = school_id AND name = 'Computer Lab';
SELECT id INTO room_music FROM rooms WHERE school_id = school_id AND name = 'Music Room';
SELECT id INTO room_lib FROM rooms WHERE school_id = school_id AND name = 'Library';

-- =============================================================================
-- 9. PERIODS (8:00 - 16:00, 1 hour each)
-- =============================================================================
INSERT INTO periods (id, school_id, name, start_time, end_time, position) VALUES
  ('ffff0001-0000-0000-0000-000000000000', school_id, 'Period 1', '08:00', '09:00', 1),
  ('ffff0002-0000-0000-0000-000000000000', school_id, 'Period 2', '09:00', '10:00', 2),
  ('ffff0003-0000-0000-0000-000000000000', school_id, 'Period 3', '10:00', '11:00', 3),
  ('ffff0004-0000-0000-0000-000000000000', school_id, 'Period 4', '11:00', '12:00', 4),
  ('ffff0005-0000-0000-0000-000000000000', school_id, 'Period 5', '12:00', '13:00', 5),
  ('ffff0006-0000-0000-0000-000000000000', school_id, 'Period 6', '13:00', '14:00', 6),
  ('ffff0007-0000-0000-0000-000000000000', school_id, 'Period 7', '14:00', '15:00', 7),
  ('ffff0008-0000-0000-0000-000000000000', school_id, 'Period 8', '15:00', '16:00', 8)
ON CONFLICT (id) DO NOTHING;

SELECT id INTO p1_id FROM periods WHERE school_id = school_id AND name = 'Period 1';
SELECT id INTO p2_id FROM periods WHERE school_id = school_id AND name = 'Period 2';
SELECT id INTO p3_id FROM periods WHERE school_id = school_id AND name = 'Period 3';
SELECT id INTO p4_id FROM periods WHERE school_id = school_id AND name = 'Period 4';
SELECT id INTO p5_id FROM periods WHERE school_id = school_id AND name = 'Period 5';
SELECT id INTO p6_id FROM periods WHERE school_id = school_id AND name = 'Period 6';
SELECT id INTO p7_id FROM periods WHERE school_id = school_id AND name = 'Period 7';
SELECT id INTO p8_id FROM periods WHERE school_id = school_id AND name = 'Period 8';

-- =============================================================================
-- 10. TIMETABLE (Grade 8A & Grade 10A — full week)
-- =============================================================================
-- day_of_week: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri

-- Grade 8A timetable
INSERT INTO timetable_slots (school_id, class_id, subject_id, staff_id, room_id, period_id, day_of_week, term_id, is_published) VALUES
  (school_id, c8a_id, subj_math, t1, room_101, p1_id, 1, term1_id, true),
  (school_id, c8a_id, subj_eng, t3, room_101, p2_id, 1, term1_id, true),
  (school_id, c8a_id, subj_sci, t5, room_lab, p3_id, 1, term1_id, true),
  (school_id, c8a_id, subj_kisw, t12, room_101, p4_id, 1, term1_id, true),
  (school_id, c8a_id, subj_sst, t7, room_101, p5_id, 1, term1_id, true),
  (school_id, c8a_id, subj_pe, t9, room_101, p6_id, 1, term1_id, true),
  (school_id, c8a_id, subj_eng, t3, room_101, p1_id, 2, term1_id, true),
  (school_id, c8a_id, subj_math, t1, room_101, p2_id, 2, term1_id, true),
  (school_id, c8a_id, subj_kisw, t12, room_101, p3_id, 2, term1_id, true),
  (school_id, c8a_id, subj_sci, t5, room_lab, p4_id, 2, term1_id, true),
  (school_id, c8a_id, subj_art, t10, room_music, p5_id, 2, term1_id, true),
  (school_id, c8a_id, subj_comp, t11, room_comp, p6_id, 2, term1_id, true),
  (school_id, c8a_id, subj_sci, t5, room_lab, p1_id, 3, term1_id, true),
  (school_id, c8a_id, subj_sst, t7, room_101, p2_id, 3, term1_id, true),
  (school_id, c8a_id, subj_math, t1, room_101, p3_id, 3, term1_id, true),
  (school_id, c8a_id, subj_eng, t3, room_101, p4_id, 3, term1_id, true),
  (school_id, c8a_id, subj_music, t10, room_music, p5_id, 3, term1_id, true),
  (school_id, c8a_id, subj_pe, t9, room_101, p6_id, 3, term1_id, true),
  (school_id, c8a_id, subj_kisw, t12, room_101, p1_id, 4, term1_id, true),
  (school_id, c8a_id, subj_math, t1, room_101, p2_id, 4, term1_id, true),
  (school_id, c8a_id, subj_sst, t7, room_101, p3_id, 4, term1_id, true),
  (school_id, c8a_id, subj_sci, t5, room_lab, p4_id, 4, term1_id, true),
  (school_id, c8a_id, subj_hsc, t10, room_music, p5_id, 4, term1_id, true),
  (school_id, c8a_id, subj_comp, t11, room_comp, p6_id, 4, term1_id, true),
  (school_id, c8a_id, subj_eng, t3, room_101, p1_id, 5, term1_id, true),
  (school_id, c8a_id, subj_kisw, t12, room_101, p2_id, 5, term1_id, true),
  (school_id, c8a_id, subj_math, t1, room_101, p3_id, 5, term1_id, true),
  (school_id, c8a_id, subj_sci, t5, room_lab, p4_id, 5, term1_id, true),
  (school_id, c8a_id, subj_art, t10, room_music, p5_id, 5, term1_id, true),
  (school_id, c8a_id, subj_pe, t9, room_101, p6_id, 5, term1_id, true)
ON CONFLICT (class_id, period_id, day_of_week, term_id) DO NOTHING;

-- Grade 10A timetable
INSERT INTO timetable_slots (school_id, class_id, subject_id, staff_id, room_id, period_id, day_of_week, term_id, is_published) VALUES
  (school_id, c10a_id, subj_math, t13, room_201, p1_id, 1, term1_id, true),
  (school_id, c10a_id, subj_eng, t12, room_201, p2_id, 1, term1_id, true),
  (school_id, c10a_id, subj_phy, t14, room_lab, p3_id, 1, term1_id, true),
  (school_id, c10a_id, subj_chem, t6, room_lab, p4_id, 1, term1_id, true),
  (school_id, c10a_id, subj_bio, t5, room_lab, p5_id, 1, term1_id, true),
  (school_id, c10a_id, subj_kisw, t4, room_201, p6_id, 1, term1_id, true),
  (school_id, c10a_id, subj_eng, t12, room_201, p1_id, 2, term1_id, true),
  (school_id, c10a_id, subj_math, t13, room_201, p2_id, 2, term1_id, true),
  (school_id, c10a_id, subj_chem, t6, room_lab, p3_id, 2, term1_id, true),
  (school_id, c10a_id, subj_phy, t14, room_lab, p4_id, 2, term1_id, true),
  (school_id, c10a_id, subj_geo, t8, room_201, p5_id, 2, term1_id, true),
  (school_id, c10a_id, subj_cs, t11, room_comp, p6_id, 2, term1_id, true),
  (school_id, c10a_id, subj_phy, t14, room_lab, p1_id, 3, term1_id, true),
  (school_id, c10a_id, subj_bio, t5, room_lab, p2_id, 3, term1_id, true),
  (school_id, c10a_id, subj_math, t13, room_201, p3_id, 3, term1_id, true),
  (school_id, c10a_id, subj_eng, t12, room_201, p4_id, 3, term1_id, true),
  (school_id, c10a_id, subj_hist, t7, room_201, p5_id, 3, term1_id, true),
  (school_id, c10a_id, subj_biz, t15, room_201, p6_id, 3, term1_id, true),
  (school_id, c10a_id, subj_chem, t6, room_lab, p1_id, 4, term1_id, true),
  (school_id, c10a_id, subj_math, t13, room_201, p2_id, 4, term1_id, true),
  (school_id, c10a_id, subj_bio, t5, room_lab, p3_id, 4, term1_id, true),
  (school_id, c10a_id, subj_kisw, t4, room_201, p4_id, 4, term1_id, true),
  (school_id, c10a_id, subj_cs, t11, room_comp, p5_id, 4, term1_id, true),
  (school_id, c10a_id, subj_pe, t9, room_201, p6_id, 4, term1_id, true),
  (school_id, c10a_id, subj_eng, t12, room_201, p1_id, 5, term1_id, true),
  (school_id, c10a_id, subj_kisw, t4, room_201, p2_id, 5, term1_id, true),
  (school_id, c10a_id, subj_geo, t8, room_201, p3_id, 5, term1_id, true),
  (school_id, c10a_id, subj_hist, t7, room_201, p4_id, 5, term1_id, true),
  (school_id, c10a_id, subj_biz, t15, room_201, p5_id, 5, term1_id, true),
  (school_id, c10a_id, subj_pe, t9, room_201, p6_id, 5, term1_id, true)
ON CONFLICT (class_id, period_id, day_of_week, term_id) DO NOTHING;

-- =============================================================================
-- 11. STUDENTS (100 students across all classes)
-- =============================================================================

-- Grade 1A: 5 students (GVA-001 to GVA-005)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000001-0000-0000-0000-000000000000', school_id, 'GVA-001', 'Amara', 'Wanjiru', '2017-03-14', 'female', c1a_id),
  ('s0000002-0000-0000-0000-000000000000', school_id, 'GVA-002', 'Kofi', 'Kamau', '2016-09-22', 'male', c1a_id),
  ('s0000003-0000-0000-0000-000000000000', school_id, 'GVA-003', 'Nia', 'Achieng', '2017-01-05', 'female', c1a_id),
  ('s0000004-0000-0000-0000-000000000000', school_id, 'GVA-004', 'Tendai', 'Mwangi', '2016-11-30', 'male', c1a_id),
  ('s0000005-0000-0000-0000-000000000000', school_id, 'GVA-005', 'Zuri', 'Njeri', '2017-06-18', 'female', c1a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 1B: 5 students (GVA-006 to GVA-010)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000006-0000-0000-0000-000000000000', school_id, 'GVA-006', 'Jabari', 'Odhiambo', '2017-04-10', 'male', c1b_id),
  ('s0000007-0000-0000-0000-000000000000', school_id, 'GVA-007', 'Imani', 'Wambui', '2016-12-25', 'female', c1b_id),
  ('s0000008-0000-0000-0000-000000000000', school_id, 'GVA-008', 'Rashid', 'Kimani', '2017-08-03', 'male', c1b_id),
  ('s0000009-0000-0000-0000-000000000000', school_id, 'GVA-009', 'Asha', 'Jepkoech', '2017-02-14', 'female', c1b_id),
  ('s0000010-0000-0000-0000-000000000000', school_id, 'GVA-010', 'Baraka', 'Mutua', '2016-10-07', 'male', c1b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 2A: 5 students (GVA-011 to GVA-015)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000011-0000-0000-0000-000000000000', school_id, 'GVA-011', 'Chidi', 'Otieno', '2016-05-20', 'male', c2a_id),
  ('s0000012-0000-0000-0000-000000000000', school_id, 'GVA-012', 'Dara', 'Akinyi', '2015-09-12', 'female', c2a_id),
  ('s0000013-0000-0000-0000-000000000000', school_id, 'GVA-013', 'Faraji', 'Kiprop', '2016-07-01', 'male', c2a_id),
  ('s0000014-0000-0000-0000-000000000000', school_id, 'GVA-014', 'Halima', 'Wanjiku', '2015-11-28', 'female', c2a_id),
  ('s0000015-0000-0000-0000-000000000000', school_id, 'GVA-015', 'Jelani', 'Muthoni', '2016-03-15', 'male', c2a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 2B: 5 students (GVA-016 to GVA-020)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000016-0000-0000-0000-000000000000', school_id, 'GVA-016', 'Kaya', 'Ndegwa', '2015-08-19', 'female', c2b_id),
  ('s0000017-0000-0000-0000-000000000000', school_id, 'GVA-017', 'Levi', 'Kamau', '2016-01-22', 'male', c2b_id),
  ('s0000018-0000-0000-0000-000000000000', school_id, 'GVA-018', 'Malaika', 'Achieng', '2015-10-05', 'female', c2b_id),
  ('s0000019-0000-0000-0000-000000000000', school_id, 'GVA-019', 'Nelson', 'Wekesa', '2016-04-30', 'male', c2b_id),
  ('s0000020-0000-0000-0000-000000000000', school_id, 'GVA-020', 'Opal', 'Jepkoech', '2015-12-11', 'female', c2b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 3A: 5 students (GVA-021 to GVA-025)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000021-0000-0000-0000-000000000000', school_id, 'GVA-021', 'Pendo', 'Mutua', '2015-06-08', 'female', c3a_id),
  ('s0000022-0000-0000-0000-000000000000', school_id, 'GVA-022', 'Rory', 'Ochieng', '2014-09-17', 'male', c3a_id),
  ('s0000023-0000-0000-0000-000000000000', school_id, 'GVA-023', 'Safiya', 'Njeri', '2015-02-25', 'female', c3a_id),
  ('s0000024-0000-0000-0000-000000000000', school_id, 'GVA-024', 'Thabo', 'Kipchoge', '2014-11-03', 'male', c3a_id),
  ('s0000025-0000-0000-0000-000000000000', school_id, 'GVA-025', 'Ulima', 'Wambui', '2015-08-14', 'female', c3a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 3B: 5 students (GVA-026 to GVA-030)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000026-0000-0000-0000-000000000000', school_id, 'GVA-026', 'Vince', 'Kimani', '2014-07-21', 'male', c3b_id),
  ('s0000027-0000-0000-0000-000000000000', school_id, 'GVA-027', 'Wanja', 'Akinyi', '2015-01-09', 'female', c3b_id),
  ('s0000028-0000-0000-0000-000000000000', school_id, 'GVA-028', 'Xavier', 'Mwangi', '2014-10-16', 'male', c3b_id),
  ('s0000029-0000-0000-0000-000000000000', school_id, 'GVA-029', 'Yara', 'Hassan', '2015-04-02', 'female', c3b_id),
  ('s0000030-0000-0000-0000-000000000000', school_id, 'GVA-030', 'Zain', 'Odhiambo', '2014-12-28', 'male', c3b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 4A: 5 students (GVA-031 to GVA-035)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000031-0000-0000-0000-000000000000', school_id, 'GVA-031', 'Amani', 'Kiptoo', '2014-03-11', 'male', c4a_id),
  ('s0000032-0000-0000-0000-000000000000', school_id, 'GVA-032', 'Benta', 'Wanjiru', '2013-08-27', 'female', c4a_id),
  ('s0000033-0000-0000-0000-000000000000', school_id, 'GVA-033', 'Charles', 'Auma', '2014-05-19', 'male', c4a_id),
  ('s0000034-0000-0000-0000-000000000000', school_id, 'GVA-034', 'Diana', 'Jepkoech', '2013-10-04', 'female', c4a_id),
  ('s0000035-0000-0000-0000-000000000000', school_id, 'GVA-035', 'Emmanuel', 'Mutua', '2014-01-15', 'male', c4a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 4B: 5 students (GVA-036 to GVA-040)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000036-0000-0000-0000-000000000000', school_id, 'GVA-036', 'Faith', 'Ndegwa', '2013-07-12', 'female', c4b_id),
  ('s0000037-0000-0000-0000-000000000000', school_id, 'GVA-037', 'George', 'Otieno', '2014-02-28', 'male', c4b_id),
  ('s0000038-0000-0000-0000-000000000000', school_id, 'GVA-038', 'Hannah', 'Kamau', '2013-11-16', 'female', c4b_id),
  ('s0000039-0000-0000-0000-000000000000', school_id, 'GVA-039', 'Isaac', 'Wekesa', '2014-06-09', 'male', c4b_id),
  ('s0000040-0000-0000-0000-000000000000', school_id, 'GVA-040', 'Janet', 'Achieng', '2013-09-23', 'female', c4b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 5A: 5 students (GVA-041 to GVA-045)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000041-0000-0000-0000-000000000000', school_id, 'GVA-041', 'Kevin', 'Kiprop', '2013-04-07', 'male', c5a_id),
  ('s0000042-0000-0000-0000-000000000000', school_id, 'GVA-042', 'Lydia', 'Muthoni', '2012-08-19', 'female', c5a_id),
  ('s0000043-0000-0000-0000-000000000000', school_id, 'GVA-043', 'Martin', 'Njeri', '2013-01-30', 'male', c5a_id),
  ('s0000044-0000-0000-0000-000000000000', school_id, 'GVA-044', 'Nancy', 'Ochieng', '2012-11-12', 'female', c5a_id),
  ('s0000045-0000-0000-0000-000000000000', school_id, 'GVA-045', 'Oscar', 'Hassan', '2013-06-25', 'male', c5a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 5B: 5 students (GVA-046 to GVA-050)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000046-0000-0000-0000-000000000000', school_id, 'GVA-046', 'Priscilla', 'Wambui', '2012-07-03', 'female', c5b_id),
  ('s0000047-0000-0000-0000-000000000000', school_id, 'GVA-047', 'Raymond', 'Kimani', '2013-02-14', 'male', c5b_id),
  ('s0000048-0000-0000-0000-000000000000', school_id, 'GVA-048', 'Sylvia', 'Jepkoech', '2012-10-28', 'female', c5b_id),
  ('s0000049-0000-0000-0000-000000000000', school_id, 'GVA-049', 'Timothy', 'Mutua', '2013-05-11', 'male', c5b_id),
  ('s0000050-0000-0000-0000-000000000000', school_id, 'GVA-050', 'Vivian', 'Akinyi', '2012-12-17', 'female', c5b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 6A: 5 students (GVA-051 to GVA-055)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000051-0000-0000-0000-000000000000', school_id, 'GVA-051', 'Walter', 'Kipchoge', '2012-03-18', 'male', c6a_id),
  ('s0000052-0000-0000-0000-000000000000', school_id, 'GVA-052', 'Xena', 'Ndegwa', '2011-09-05', 'female', c6a_id),
  ('s0000053-0000-0000-0000-000000000000', school_id, 'GVA-053', 'Yusuf', 'Odhiambo', '2012-06-22', 'male', c6a_id),
  ('s0000054-0000-0000-0000-000000000000', school_id, 'GVA-054', 'Zawadi', 'Wanjiru', '2011-11-14', 'female', c6a_id),
  ('s0000055-0000-0000-0000-000000000000', school_id, 'GVA-055', 'Aaron', 'Mwangi', '2012-01-27', 'male', c6a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 6B: 5 students (GVA-056 to GVA-060)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000056-0000-0000-0000-000000000000', school_id, 'GVA-056', 'Brenda', 'Achieng', '2011-08-09', 'female', c6b_id),
  ('s0000057-0000-0000-0000-000000000000', school_id, 'GVA-057', 'Clement', 'Kamau', '2012-04-03', 'male', c6b_id),
  ('s0000058-0000-0000-0000-000000000000', school_id, 'GVA-058', 'Dorcas', 'Jepkoech', '2011-10-21', 'female', c6b_id),
  ('s0000059-0000-0000-0000-000000000000', school_id, 'GVA-059', 'Elijah', 'Otieno', '2012-02-15', 'male', c6b_id),
  ('s0000060-0000-0000-0000-000000000000', school_id, 'GVA-060', 'Gladys', 'Mutua', '2011-12-06', 'female', c6b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 7A: 5 students (GVA-061 to GVA-065)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000061-0000-0000-0000-000000000000', school_id, 'GVA-061', 'Harrison', 'Wekesa', '2011-05-14', 'male', c7a_id),
  ('s0000062-0000-0000-0000-000000000000', school_id, 'GVA-062', 'Irene', 'Njeri', '2010-09-28', 'female', c7a_id),
  ('s0000063-0000-0000-0000-000000000000', school_id, 'GVA-063', 'Joseph', 'Kiprop', '2011-03-07', 'male', c7a_id),
  ('s0000064-0000-0000-0000-000000000000', school_id, 'GVA-064', 'Keziah', 'Akinyi', '2010-11-19', 'female', c7a_id),
  ('s0000065-0000-0000-0000-000000000000', school_id, 'GVA-065', 'Lawrence', 'Kimani', '2011-07-01', 'male', c7a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 7B: 5 students (GVA-066 to GVA-070)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000066-0000-0000-0000-000000000000', school_id, 'GVA-066', 'Martha', 'Hassan', '2010-08-12', 'female', c7b_id),
  ('s0000067-0000-0000-0000-000000000000', school_id, 'GVA-067', 'Nicholas', 'Ochieng', '2011-02-23', 'male', c7b_id),
  ('s0000068-0000-0000-0000-000000000000', school_id, 'GVA-068', 'Olive', 'Muthoni', '2010-10-08', 'female', c7b_id),
  ('s0000069-0000-0000-0000-000000000000', school_id, 'GVA-069', 'Patrick', 'Ndegwa', '2011-04-16', 'male', c7b_id),
  ('s0000070-0000-0000-0000-000000000000', school_id, 'GVA-070', 'Queen', 'Jepkoech', '2010-12-30', 'female', c7b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 8A: 15 students (GVA-071 to GVA-085) — these get exam results
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000071-0000-0000-0000-000000000000', school_id, 'GVA-071', 'Brian', 'Kamau', '2010-03-15', 'male', c8a_id),
  ('s0000072-0000-0000-0000-000000000000', school_id, 'GVA-072', 'Aisha', 'Hassan', '2010-07-22', 'female', c8a_id),
  ('s0000073-0000-0000-0000-000000000000', school_id, 'GVA-073', 'Kevin', 'Otieno', '2010-01-10', 'male', c8a_id),
  ('s0000074-0000-0000-0000-000000000000', school_id, 'GVA-074', 'Mercy', 'Wambui', '2010-11-05', 'female', c8a_id),
  ('s0000075-0000-0000-0000-000000000000', school_id, 'GVA-075', 'David', 'Mutua', '2009-06-18', 'male', c8a_id),
  ('s0000076-0000-0000-0000-000000000000', school_id, 'GVA-076', 'Sarah', 'Njeri', '2009-09-30', 'female', c8a_id),
  ('s0000077-0000-0000-0000-000000000000', school_id, 'GVA-077', 'Peter', 'Kimani', '2009-04-12', 'male', c8a_id),
  ('s0000078-0000-0000-0000-000000000000', school_id, 'GVA-078', 'Esther', 'Akinyi', '2009-08-25', 'female', c8a_id),
  ('s0000079-0000-0000-0000-000000000000', school_id, 'GVA-079', 'Samuel', 'Kipchoge', '2009-02-14', 'male', c8a_id),
  ('s0000080-0000-0000-0000-000000000000', school_id, 'GVA-080', 'Lucy', 'Muthoni', '2009-12-01', 'female', c8a_id),
  ('s0000081-0000-0000-0000-000000000000', school_id, 'GVA-081', 'John', 'Omondi', '2008-05-20', 'male', c8a_id),
  ('s0000082-0000-0000-0000-000000000000', school_id, 'GVA-082', 'Faith', 'Jepkoech', '2008-10-08', 'female', c8a_id),
  ('s0000083-0000-0000-0000-000000000000', school_id, 'GVA-083', 'Michael', 'Wekesa', '2008-03-28', 'male', c8a_id),
  ('s0000084-0000-0000-0000-000000000000', school_id, 'GVA-084', 'Catherine', 'Auma', '2008-07-16', 'female', c8a_id),
  ('s0000085-0000-0000-0000-000000000000', school_id, 'GVA-085', 'Daniel', 'Kiptoo', '2008-01-09', 'male', c8a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 8B: 5 students (GVA-086 to GVA-090)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000086-0000-0000-0000-000000000000', school_id, 'GVA-086', 'Evelyn', 'Wanjiru', '2009-11-12', 'female', c8b_id),
  ('s0000087-0000-0000-0000-000000000000', school_id, 'GVA-087', 'Felix', 'Odhiambo', '2010-02-08', 'male', c8b_id),
  ('s0000088-0000-0000-0000-000000000000', school_id, 'GVA-088', 'Gloria', 'Ndegwa', '2009-06-30', 'female', c8b_id),
  ('s0000089-0000-0000-0000-000000000000', school_id, 'GVA-089', 'Henry', 'Kiprop', '2010-04-17', 'male', c8b_id),
  ('s0000090-0000-0000-0000-000000000000', school_id, 'GVA-090', 'Joyce', 'Achieng', '2009-08-05', 'female', c8b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 9A: 3 students (GVA-091 to GVA-093)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000091-0000-0000-0000-000000000000', school_id, 'GVA-091', 'Keith', 'Mwangi', '2009-01-22', 'male', c9a_id),
  ('s0000092-0000-0000-0000-000000000000', school_id, 'GVA-092', 'Lilian', 'Njeri', '2008-05-14', 'female', c9a_id),
  ('s0000093-0000-0000-0000-000000000000', school_id, 'GVA-093', 'Malcolm', 'Kimani', '2009-09-03', 'male', c9a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 9B: 2 students (GVA-094 to GVA-095)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000094-0000-0000-0000-000000000000', school_id, 'GVA-094', 'Natalie', 'Hassan', '2008-12-11', 'female', c9b_id),
  ('s0000095-0000-0000-0000-000000000000', school_id, 'GVA-095', 'Owen', 'Otieno', '2009-03-27', 'male', c9b_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 10A: 3 students (GVA-096 to GVA-098)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000096-0000-0000-0000-000000000000', school_id, 'GVA-096', 'Pauline', 'Wambui', '2008-02-19', 'female', c10a_id),
  ('s0000097-0000-0000-0000-000000000000', school_id, 'GVA-097', 'Quincy', 'Kamau', '2007-06-08', 'male', c10a_id),
  ('s0000098-0000-0000-0000-000000000000', school_id, 'GVA-098', 'Rose', 'Jepkoech', '2008-10-25', 'female', c10a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 11A: 1 student (GVA-099)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000099-0000-0000-0000-000000000000', school_id, 'GVA-099', 'Sean', 'Ochieng', '2007-04-14', 'male', c11a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Grade 12A: 1 student (GVA-100)
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id) VALUES
  ('s0000100-0000-0000-0000-000000000000', school_id, 'GVA-100', 'Tracy', 'Auma', '2006-08-30', 'female', c12a_id)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Collect student IDs
FOR i IN 1..100 LOOP
  s_ids[i] := ('s00000' || LPAD(i::text, 3, '0') || '-0000-0000-0000-000000000000')::UUID;
END LOOP;

-- =============================================================================
-- 12. FEE STRUCTURES
-- =============================================================================
INSERT INTO fee_structures (id, school_id, name, amount, academic_year_id) VALUES
  ('aaaaa001-0000-0000-0000-000000000000', school_id, 'Tuition Fee - Term 1', 45000, year_id),
  ('aaaaa002-0000-0000-0000-000000000000', school_id, 'Activities Fee - Term 1', 5000, year_id),
  ('aaaaa003-0000-0000-0000-000000000000', school_id, 'Library Fee - Term 1', 3000, year_id),
  ('aaaaa004-0000-0000-0000-000000000000', school_id, 'Computer Lab Fee - Term 1', 4000, year_id)
ON CONFLICT (id) DO NOTHING;

SELECT id INTO fs_tuition FROM fee_structures WHERE school_id = school_id AND name = 'Tuition Fee - Term 1';
SELECT id INTO fs_activities FROM fee_structures WHERE school_id = school_id AND name = 'Activities Fee - Term 1';
SELECT id INTO fs_library FROM fee_structures WHERE school_id = school_id AND name = 'Library Fee - Term 1';
SELECT id INTO fs_computer FROM fee_structures WHERE school_id = school_id AND name = 'Computer Lab Fee - Term 1';

-- =============================================================================
-- 13. STUDENT ACCOUNTS (tuition fee for all 100 students)
-- =============================================================================
-- Students 1-35: fully paid | 36-70: partial | 71-100: overdue/minimal
FOR i IN 1..100 LOOP
  a_ids[i] := ('aaaa' || LPAD(i::text, 4, '0') || '-0000-0000-0000-000000000000')::UUID;
END LOOP;

FOR i IN 1..35 LOOP
  INSERT INTO student_accounts (id, school_id, student_id, fee_structure_id, amount_due, amount_paid)
  VALUES (a_ids[i], school_id, s_ids[i], fs_tuition, 45000, 45000)
  ON CONFLICT (id) DO NOTHING;
END LOOP;

FOR i IN 36..70 LOOP
  INSERT INTO student_accounts (id, school_id, student_id, fee_structure_id, amount_due, amount_paid)
  VALUES (a_ids[i], school_id, s_ids[i], fs_tuition, 45000, 45000 * (0.3 + (random() * 0.5)))
  ON CONFLICT (id) DO NOTHING;
END LOOP;

FOR i IN 71..100 LOOP
  INSERT INTO student_accounts (id, school_id, student_id, fee_structure_id, amount_due, amount_paid)
  VALUES (a_ids[i], school_id, s_ids[i], fs_tuition, 45000, 45000 * (random() * 0.2))
  ON CONFLICT (id) DO NOTHING;
END LOOP;

-- =============================================================================
-- 14. GRADING SYSTEM (CBC standard grades)
-- =============================================================================
INSERT INTO grading_systems (school_id, term_id, grade_label, min_score, max_score, description, position) VALUES
  (school_id, term1_id, 'A', 80, 100, 'Excellent', 1),
  (school_id, term1_id, 'B', 65, 79, 'Good', 2),
  (school_id, term1_id, 'C', 50, 64, 'Satisfactory', 3),
  (school_id, term1_id, 'D', 40, 49, 'Below Average', 4),
  (school_id, term1_id, 'E', 0, 39, 'Needs Improvement', 5)
ON CONFLICT (school_id, term_id, grade_label) DO NOTHING;

-- =============================================================================
-- 15. EXAM & RESULTS (Grade 8A Midterm, March 2026)
-- =============================================================================
INSERT INTO exams (id, school_id, name, term_id, exam_date, exam_type, total_marks)
VALUES ('eeeeeee1-0000-0000-0000-000000000000', school_id, 'Grade 8 Midterm - Term 1', term1_id, '2026-03-16', 'midterm', 100)
ON CONFLICT (id) DO NOTHING;

SELECT id INTO exam_midterm FROM exams WHERE school_id = school_id AND name = 'Grade 8 Midterm - Term 1';

INSERT INTO exam_results (exam_id, student_id, subject_id, score, grade, percentage) VALUES
  (exam_midterm, 's0000071-0000-0000-0000-000000000000', subj_math, 78, 'B', 78),
  (exam_midterm, 's0000071-0000-0000-0000-000000000000', subj_eng, 82, 'A', 82),
  (exam_midterm, 's0000071-0000-0000-0000-000000000000', subj_kisw, 71, 'B', 71),
  (exam_midterm, 's0000071-0000-0000-0000-000000000000', subj_sci, 85, 'A', 85),
  (exam_midterm, 's0000071-0000-0000-0000-000000000000', subj_sst, 68, 'B', 68),
  (exam_midterm, 's0000072-0000-0000-0000-000000000000', subj_math, 92, 'A', 92),
  (exam_midterm, 's0000072-0000-0000-0000-000000000000', subj_eng, 88, 'A', 88),
  (exam_midterm, 's0000072-0000-0000-0000-000000000000', subj_kisw, 76, 'B', 76),
  (exam_midterm, 's0000072-0000-0000-0000-000000000000', subj_sci, 90, 'A', 90),
  (exam_midterm, 's0000072-0000-0000-0000-000000000000', subj_sst, 84, 'A', 84),
  (exam_midterm, 's0000073-0000-0000-0000-000000000000', subj_math, 55, 'C', 55),
  (exam_midterm, 's0000073-0000-0000-0000-000000000000', subj_eng, 62, 'C', 62),
  (exam_midterm, 's0000073-0000-0000-0000-000000000000', subj_kisw, 48, 'D', 48),
  (exam_midterm, 's0000073-0000-0000-0000-000000000000', subj_sci, 58, 'C', 58),
  (exam_midterm, 's0000073-0000-0000-0000-000000000000', subj_sst, 72, 'B', 72),
  (exam_midterm, 's0000074-0000-0000-0000-000000000000', subj_math, 87, 'A', 87),
  (exam_midterm, 's0000074-0000-0000-0000-000000000000', subj_eng, 91, 'A', 91),
  (exam_midterm, 's0000074-0000-0000-0000-000000000000', subj_kisw, 83, 'A', 83),
  (exam_midterm, 's0000074-0000-0000-0000-000000000000', subj_sci, 79, 'B', 79),
  (exam_midterm, 's0000074-0000-0000-0000-000000000000', subj_sst, 88, 'A', 88),
  (exam_midterm, 's0000075-0000-0000-0000-000000000000', subj_math, 42, 'D', 42),
  (exam_midterm, 's0000075-0000-0000-0000-000000000000', subj_eng, 51, 'C', 51),
  (exam_midterm, 's0000075-0000-0000-0000-000000000000', subj_kisw, 39, 'E', 39),
  (exam_midterm, 's0000075-0000-0000-0000-000000000000', subj_sci, 47, 'D', 47),
  (exam_midterm, 's0000075-0000-0000-0000-000000000000', subj_sst, 55, 'C', 55),
  (exam_midterm, 's0000076-0000-0000-0000-000000000000', subj_math, 95, 'A', 95),
  (exam_midterm, 's0000076-0000-0000-0000-000000000000', subj_eng, 89, 'A', 89),
  (exam_midterm, 's0000076-0000-0000-0000-000000000000', subj_kisw, 81, 'A', 81),
  (exam_midterm, 's0000076-0000-0000-0000-000000000000', subj_sci, 93, 'A', 93),
  (exam_midterm, 's0000076-0000-0000-0000-000000000000', subj_sst, 86, 'A', 86),
  (exam_midterm, 's0000077-0000-0000-0000-000000000000', subj_math, 63, 'C', 63),
  (exam_midterm, 's0000077-0000-0000-0000-000000000000', subj_eng, 57, 'C', 57),
  (exam_midterm, 's0000077-0000-0000-0000-000000000000', subj_kisw, 70, 'B', 70),
  (exam_midterm, 's0000077-0000-0000-0000-000000000000', subj_sci, 61, 'C', 61),
  (exam_midterm, 's0000077-0000-0000-0000-000000000000', subj_sst, 54, 'C', 54),
  (exam_midterm, 's0000078-0000-0000-0000-000000000000', subj_math, 74, 'B', 74),
  (exam_midterm, 's0000078-0000-0000-0000-000000000000', subj_eng, 80, 'A', 80),
  (exam_midterm, 's0000078-0000-0000-0000-000000000000', subj_kisw, 77, 'B', 77),
  (exam_midterm, 's0000078-0000-0000-0000-000000000000', subj_sci, 69, 'B', 69),
  (exam_midterm, 's0000078-0000-0000-0000-000000000000', subj_sst, 73, 'B', 73),
  (exam_midterm, 's0000079-0000-0000-0000-000000000000', subj_math, 81, 'A', 81),
  (exam_midterm, 's0000079-0000-0000-0000-000000000000', subj_eng, 75, 'B', 75),
  (exam_midterm, 's0000079-0000-0000-0000-000000000000', subj_kisw, 66, 'B', 66),
  (exam_midterm, 's0000079-0000-0000-0000-000000000000', subj_sci, 82, 'A', 82),
  (exam_midterm, 's0000079-0000-0000-0000-000000000000', subj_sst, 78, 'B', 78),
  (exam_midterm, 's0000080-0000-0000-0000-000000000000', subj_math, 46, 'D', 46),
  (exam_midterm, 's0000080-0000-0000-0000-000000000000', subj_eng, 58, 'C', 58),
  (exam_midterm, 's0000080-0000-0000-0000-000000000000', subj_kisw, 64, 'C', 64),
  (exam_midterm, 's0000080-0000-0000-0000-000000000000', subj_sci, 44, 'D', 44),
  (exam_midterm, 's0000080-0000-0000-0000-000000000000', subj_sst, 52, 'C', 52),
  (exam_midterm, 's0000081-0000-0000-0000-000000000000', subj_math, 70, 'B', 70),
  (exam_midterm, 's0000081-0000-0000-0000-000000000000', subj_eng, 65, 'B', 65),
  (exam_midterm, 's0000081-0000-0000-0000-000000000000', subj_kisw, 59, 'C', 59),
  (exam_midterm, 's0000081-0000-0000-0000-000000000000', subj_sci, 73, 'B', 73),
  (exam_midterm, 's0000081-0000-0000-0000-000000000000', subj_sst, 67, 'B', 67),
  (exam_midterm, 's0000082-0000-0000-0000-000000000000', subj_math, 88, 'A', 88),
  (exam_midterm, 's0000082-0000-0000-0000-000000000000', subj_eng, 84, 'A', 84),
  (exam_midterm, 's0000082-0000-0000-0000-000000000000', subj_kisw, 79, 'B', 79),
  (exam_midterm, 's0000082-0000-0000-0000-000000000000', subj_sci, 91, 'A', 91),
  (exam_midterm, 's0000082-0000-0000-0000-000000000000', subj_sst, 75, 'B', 75),
  (exam_midterm, 's0000083-0000-0000-0000-000000000000', subj_math, 37, 'E', 37),
  (exam_midterm, 's0000083-0000-0000-0000-000000000000', subj_eng, 43, 'D', 43),
  (exam_midterm, 's0000083-0000-0000-0000-000000000000', subj_kisw, 41, 'D', 41),
  (exam_midterm, 's0000083-0000-0000-0000-000000000000', subj_sci, 50, 'C', 50),
  (exam_midterm, 's0000083-0000-0000-0000-000000000000', subj_sst, 38, 'E', 38),
  (exam_midterm, 's0000084-0000-0000-0000-000000000000', subj_math, 76, 'B', 76),
  (exam_midterm, 's0000084-0000-0000-0000-000000000000', subj_eng, 82, 'A', 82),
  (exam_midterm, 's0000084-0000-0000-0000-000000000000', subj_kisw, 85, 'A', 85),
  (exam_midterm, 's0000084-0000-0000-0000-000000000000', subj_sci, 71, 'B', 71),
  (exam_midterm, 's0000084-0000-0000-0000-000000000000', subj_sst, 79, 'B', 79),
  (exam_midterm, 's0000085-0000-0000-0000-000000000000', subj_math, 69, 'B', 69),
  (exam_midterm, 's0000085-0000-0000-0000-000000000000', subj_eng, 74, 'B', 74),
  (exam_midterm, 's0000085-0000-0000-0000-000000000000', subj_kisw, 60, 'C', 60),
  (exam_midterm, 's0000085-0000-0000-0000-000000000000', subj_sci, 77, 'B', 77),
  (exam_midterm, 's0000085-0000-0000-0000-000000000000', subj_sst, 63, 'C', 63)
ON CONFLICT (exam_id, student_id, subject_id) DO NOTHING;

-- =============================================================================
-- 16. ATTENDANCE RECORDS (Grade 8A, 5 school days in March 2026)
-- =============================================================================
INSERT INTO attendance_records (school_id, student_id, date, status, recorded_by) VALUES
  -- Monday 2026-03-10
  (school_id, 's0000071-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000072-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000073-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000074-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000075-0000-0000-0000-000000000000', '2026-03-10', 'late', SUPER_ADMIN_USER_ID),
  (school_id, 's0000076-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000077-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000078-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000079-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000080-0000-0000-0000-000000000000', '2026-03-10', 'absent', SUPER_ADMIN_USER_ID),
  (school_id, 's0000081-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000082-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000083-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000084-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000085-0000-0000-0000-000000000000', '2026-03-10', 'present', SUPER_ADMIN_USER_ID),
  -- Tuesday 2026-03-11
  (school_id, 's0000071-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000072-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000073-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000074-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000075-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000076-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000077-0000-0000-0000-000000000000', '2026-03-11', 'late', SUPER_ADMIN_USER_ID),
  (school_id, 's0000078-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000079-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000080-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000081-0000-0000-0000-000000000000', '2026-03-11', 'absent', SUPER_ADMIN_USER_ID),
  (school_id, 's0000082-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000083-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000084-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000085-0000-0000-0000-000000000000', '2026-03-11', 'present', SUPER_ADMIN_USER_ID),
  -- Wednesday 2026-03-12
  (school_id, 's0000071-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000072-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000073-0000-0000-0000-000000000000', '2026-03-12', 'excused', SUPER_ADMIN_USER_ID),
  (school_id, 's0000074-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000075-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000076-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000077-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000078-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000079-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000080-0000-0000-0000-000000000000', '2026-03-12', 'late', SUPER_ADMIN_USER_ID),
  (school_id, 's0000081-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000082-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000083-0000-0000-0000-000000000000', '2026-03-12', 'absent', SUPER_ADMIN_USER_ID),
  (school_id, 's0000084-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000085-0000-0000-0000-000000000000', '2026-03-12', 'present', SUPER_ADMIN_USER_ID),
  -- Thursday 2026-03-13
  (school_id, 's0000071-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000072-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000073-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000074-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000075-0000-0000-0000-000000000000', '2026-03-13', 'absent', SUPER_ADMIN_USER_ID),
  (school_id, 's0000076-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000077-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000078-0000-0000-0000-000000000000', '2026-03-13', 'late', SUPER_ADMIN_USER_ID),
  (school_id, 's0000079-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000080-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000081-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000082-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000083-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000084-0000-0000-0000-000000000000', '2026-03-13', 'excused', SUPER_ADMIN_USER_ID),
  (school_id, 's0000085-0000-0000-0000-000000000000', '2026-03-13', 'present', SUPER_ADMIN_USER_ID),
  -- Friday 2026-03-14
  (school_id, 's0000071-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000072-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000073-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000074-0000-0000-0000-000000000000', '2026-03-14', 'absent', SUPER_ADMIN_USER_ID),
  (school_id, 's0000075-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000076-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000077-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000078-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000079-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000080-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000081-0000-0000-0000-000000000000', '2026-03-14', 'late', SUPER_ADMIN_USER_ID),
  (school_id, 's0000082-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000083-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000084-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID),
  (school_id, 's0000085-0000-0000-0000-000000000000', '2026-03-14', 'present', SUPER_ADMIN_USER_ID)
ON CONFLICT (student_id, date) DO NOTHING;

-- =============================================================================
-- 17. ANNOUNCEMENTS
-- =============================================================================
INSERT INTO announcements (school_id, title, content, author_id, target_roles, is_published) VALUES
  (school_id, 'Welcome Back - Term 1 2026',
   'Dear parents and students, we welcome you back to Green Valley Academy for Term 1, 2026. School opens on Monday 5th January at 7:30 AM. Please ensure all fees are paid before the opening day. We look forward to a productive term!',
   SUPER_ADMIN_USER_ID, ARRAY['super_admin'::member_role, 'principal'::member_role, 'teacher'::member_role, 'parent'::member_role], true),
  (school_id, 'Science Fair 2026',
   'Green Valley Academy will host its annual Science Fair on Friday 20th March 2026. All students from Grade 4 to Grade 12 are encouraged to participate. Registration forms are available from the science department. Prizes will be awarded for the best projects.',
   SUPER_ADMIN_USER_ID, ARRAY['super_admin'::member_role, 'principal'::member_role, 'teacher'::member_role, 'parent'::member_role], true),
  (school_id, 'Mid-Term Break Notice',
   'Please be informed that the mid-term break will begin on Friday 27th March 2026 and classes resume on Monday 7th April 2026. Students are expected to complete all assigned holiday homework. Parents are encouraged to ensure students use the break productively.',
   SUPER_ADMIN_USER_ID, ARRAY['super_admin'::member_role, 'principal'::member_role, 'teacher'::member_role, 'parent'::member_role], true)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Green Valley Academy seed data complete! School ID: %', school_id;

END $$;
