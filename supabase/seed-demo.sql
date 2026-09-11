-- Multi-Portal Demo Seed Data for Decimal
-- Creates demo users for all portals with a shared demo school
-- Password for all demo accounts: Demo1234!

-- ============================================================
-- PRINCIPAL PORTAL
-- ============================================================
-- Email: principal@decimal.app
-- Password: Demo1234!
-- Role: Principal
-- Portal: /principal

-- ============================================================
-- TEACHER PORTAL
-- ============================================================
-- Email: teacher@decimal.app
-- Password: Demo1234!
-- Role: Teacher
-- Portal: /teacher

-- ============================================================
-- PARENT PORTAL
-- ============================================================
-- Email: parent@decimal.app
-- Password: Demo1234!
-- Role: Parent
-- Portal: /parent

-- ============================================================
-- FINANCE PORTAL
-- ============================================================
-- Email: finance@decimal.app
-- Password: Demo1234!
-- Role: Finance
-- Portal: /finance

-- ============================================================
-- SECRETARY PORTAL
-- ============================================================
-- Email: secretary@decimal.app
-- Password: Demo1234!
-- Role: Secretary
-- Portal: /secretary

-- ============================================================
-- ADMISSIONS PORTAL
-- ============================================================
-- Email: admissions@decimal.app
-- Password: Demo1234!
-- Role: Admissions Officer
-- Portal: /admissions-officer

-- ============================================================
-- SUPER ADMIN (DO NOT SHARE — internal use only)
-- ============================================================
-- Email: admin@decimal.app
-- Password: Dec1m@lAdm!n2026
-- Role: Super Admin
-- Portal: /super-admin

-- ============================================================
-- SCHOOL SEED DATA
-- ============================================================

DO $$
DECLARE
  principal_id UUID;
  teacher_id UUID;
  parent_user_id UUID;
  finance_id UUID;
  secretary_id UUID;
  admissions_id UUID;
  demo_school_id UUID;
  demo_year_id UUID;
  demo_term_id UUID;
  grade1_id UUID;
  grade2_id UUID;
  grade3_id UUID;
  class1_id UUID;
  class2_id UUID;
  class3_id UUID;
  subject_math_id UUID;
  subject_eng_id UUID;
  subject_sci_id UUID;
  subject_kisw_id UUID;
  subject_hist_id UUID;
  teacher1_staff_id UUID;
  teacher2_staff_id UUID;
  teacher3_staff_id UUID;
  fee_structure_id UUID;
  student1_id UUID;
  student2_id UUID;
  student3_id UUID;
  student4_id UUID;
  student5_id UUID;
  student6_id UUID;
  student7_id UUID;
  student8_id UUID;
  student9_id UUID;
  student10_id UUID;
  student11_id UUID;
  student12_id UUID;
  student13_id UUID;
  student14_id UUID;
  student15_id UUID;
  parent1_id UUID;
  parent2_id UUID;
  account1_id UUID;
  account2_id UUID;
  account3_id UUID;
  account4_id UUID;
  account5_id UUID;
  account6_id UUID;
  account7_id UUID;
  account8_id UUID;
  account9_id UUID;
  account10_id UUID;
  account11_id UUID;
  account12_id UUID;
  account13_id UUID;
  account14_id UUID;
  account15_id UUID;
BEGIN
  -- Get all user IDs
  SELECT id INTO principal_id FROM auth.users WHERE email = 'principal@decimal.app' LIMIT 1;
  SELECT id INTO teacher_id FROM auth.users WHERE email = 'teacher@decimal.app' LIMIT 1;
  SELECT id INTO parent_user_id FROM auth.users WHERE email = 'parent@decimal.app' LIMIT 1;
  SELECT id INTO finance_id FROM auth.users WHERE email = 'finance@decimal.app' LIMIT 1;
  SELECT id INTO secretary_id FROM auth.users WHERE email = 'secretary@decimal.app' LIMIT 1;
  SELECT id INTO admissions_id FROM auth.users WHERE email = 'admissions@decimal.app' LIMIT 1;

  IF principal_id IS NULL THEN
    RAISE EXCEPTION 'Principal user not found. Create principal@decimal.app in Supabase Auth first.';
  END IF;

  -- Create school
  INSERT INTO schools (name, slug, school_type, education_level, country, address, phone, email, status, subscription_status)
  VALUES ('Decimal Demo Academy', 'decimal-demo', 'private', 'junior_senior', 'KE', '123 Demo Street, Nairobi', '+254 700 000 000', 'demo@decimal.app', 'active', 'trial')
  RETURNING id INTO demo_school_id;

  -- Add all users as school members
  INSERT INTO school_members (user_id, school_id, role, is_active) VALUES
    (principal_id, demo_school_id, 'principal', true),
    (teacher_id, demo_school_id, 'teacher', true),
    (parent_user_id, demo_school_id, 'parent', true),
    (finance_id, demo_school_id, 'finance', true),
    (secretary_id, demo_school_id, 'secretary', true),
    (admissions_id, demo_school_id, 'admissions_officer', true);

  -- Profiles
  INSERT INTO profiles (id, full_name, phone) VALUES
    (principal_id, 'Demo Principal', '+254 700 000 001'),
    (teacher_id, 'Demo Teacher', '+254 700 000 002'),
    (parent_user_id, 'Demo Parent', '+254 700 000 003'),
    (finance_id, 'Demo Finance', '+254 700 000 004'),
    (secretary_id, 'Demo Secretary', '+254 700 000 005'),
    (admissions_id, 'Demo Admissions', '+254 700 000 006')
  ON CONFLICT (id) DO NOTHING;

  -- Academic year
  INSERT INTO academic_years (school_id, name, start_date, end_date, is_current)
  VALUES (demo_school_id, '2026', '2026-01-05', '2026-11-27', true)
  RETURNING id INTO demo_year_id;

  -- Terms
  INSERT INTO terms (academic_year_id, name, start_date, end_date, is_current)
  VALUES 
    (demo_year_id, 'Term 1', '2026-01-05', '2026-04-01', true),
    (demo_year_id, 'Term 2', '2026-04-27', '2026-07-31', false),
    (demo_year_id, 'Term 3', '2026-08-24', '2026-11-27', false)
  RETURNING id INTO demo_term_id;

  -- Grades
  INSERT INTO grades (school_id, name, level) VALUES
    (demo_school_id, 'Grade 1', 1) RETURNING id INTO grade1_id,
    (demo_school_id, 'Grade 2', 2) RETURNING id INTO grade2_id,
    (demo_school_id, 'Grade 3', 3) RETURNING id INTO grade3_id;

  -- Classes
  INSERT INTO classes (school_id, grade_id, name, stream, capacity) VALUES
    (demo_school_id, grade1_id, 'Form 1', 'A', 40) RETURNING id INTO class1_id,
    (demo_school_id, grade2_id, 'Form 2', 'A', 40) RETURNING id INTO class2_id,
    (demo_school_id, grade3_id, 'Form 3', 'A', 35) RETURNING id INTO class3_id;

  -- Subjects
  INSERT INTO subjects (school_id, name, code) VALUES
    (demo_school_id, 'Mathematics', 'MATH') RETURNING id INTO subject_math_id,
    (demo_school_id, 'English', 'ENG') RETURNING id INTO subject_eng_id,
    (demo_school_id, 'Science', 'SCI') RETURNING id INTO subject_sci_id,
    (demo_school_id, 'Kiswahili', 'KISW') RETURNING id INTO subject_kisw_id,
    (demo_school_id, 'History', 'HIST') RETURNING id INTO subject_hist_id;

  -- Staff (teachers)
  INSERT INTO staff (school_id, employee_number, first_name, last_name, role, department) VALUES
    (demo_school_id, 'T001', 'Grace', 'Wanjiku', 'teacher', 'Mathematics') RETURNING id INTO teacher1_staff_id,
    (demo_school_id, 'T002', 'James', 'Ochieng', 'teacher', 'Languages') RETURNING id INTO teacher2_staff_id,
    (demo_school_id, 'T003', 'Fatuma', 'Abdullah', 'teacher', 'Sciences') RETURNING id INTO teacher3_staff_id;

  -- Link teacher demo user to staff record
  UPDATE staff SET user_id = teacher_id WHERE id = teacher1_staff_id;

  -- Class teachers
  INSERT INTO class_teachers (class_id, staff_id, subject_id) VALUES
    (class1_id, teacher1_staff_id, subject_math_id),
    (class2_id, teacher2_staff_id, subject_eng_id),
    (class3_id, teacher3_staff_id, subject_sci_id);

  -- Students (15 students)
  INSERT INTO students (school_id, admission_number, first_name, last_name, date_of_birth, gender, class_id, parent_id) VALUES
    (demo_school_id, 'ADM001', 'Brian', 'Kamau', '2010-03-15', 'male', class1_id, parent_user_id),
    (demo_school_id, 'ADM002', 'Aisha', 'Hassan', '2010-07-22', 'female', class1_id, parent_user_id),
    (demo_school_id, 'ADM003', 'Kevin', 'Otieno', '2010-01-10', 'male', class1_id, parent_user_id),
    (demo_school_id, 'ADM004', 'Mercy', 'Wambui', '2010-11-05', 'female', class1_id, parent_user_id),
    (demo_school_id, 'ADM005', 'David', 'Mutua', '2009-06-18', 'male', class1_id, parent_user_id),
    (demo_school_id, 'ADM006', 'Sarah', 'Njeri', '2009-09-30', 'female', class2_id, parent_user_id),
    (demo_school_id, 'ADM007', 'Peter', 'Kimani', '2009-04-12', 'male', class2_id, parent_user_id),
    (demo_school_id, 'ADM008', 'Esther', 'Akinyi', '2009-08-25', 'female', class2_id, parent_user_id),
    (demo_school_id, 'ADM009', 'Samuel', 'Kipchoge', '2009-02-14', 'male', class2_id, parent_user_id),
    (demo_school_id, 'ADM010', 'Lucy', 'Muthoni', '2009-12-01', 'female', class2_id, parent_user_id),
    (demo_school_id, 'ADM011', 'John', 'Omondi', '2008-05-20', 'male', class3_id, parent_user_id),
    (demo_school_id, 'ADM012', 'Faith', 'Jepkoech', '2008-10-08', 'female', class3_id, parent_user_id),
    (demo_school_id, 'ADM013', 'Michael', 'Wekesa', '2008-03-28', 'male', class3_id, parent_user_id),
    (demo_school_id, 'ADM014', 'Catherine', 'Auma', '2008-07-16', 'female', class3_id, parent_user_id),
    (demo_school_id, 'ADM015', 'Daniel', 'Kiptoo', '2008-01-09', 'male', class3_id, parent_user_id)
  RETURNING id INTO student1_id;

  -- Get remaining student IDs
  SELECT id INTO student2_id FROM students WHERE admission_number = 'ADM002' AND school_id = demo_school_id;
  SELECT id INTO student3_id FROM students WHERE admission_number = 'ADM003' AND school_id = demo_school_id;
  SELECT id INTO student4_id FROM students WHERE admission_number = 'ADM004' AND school_id = demo_school_id;
  SELECT id INTO student5_id FROM students WHERE admission_number = 'ADM005' AND school_id = demo_school_id;
  SELECT id INTO student6_id FROM students WHERE admission_number = 'ADM006' AND school_id = demo_school_id;
  SELECT id INTO student7_id FROM students WHERE admission_number = 'ADM007' AND school_id = demo_school_id;
  SELECT id INTO student8_id FROM students WHERE admission_number = 'ADM008' AND school_id = demo_school_id;
  SELECT id INTO student9_id FROM students WHERE admission_number = 'ADM009' AND school_id = demo_school_id;
  SELECT id INTO student10_id FROM students WHERE admission_number = 'ADM010' AND school_id = demo_school_id;
  SELECT id INTO student11_id FROM students WHERE admission_number = 'ADM011' AND school_id = demo_school_id;
  SELECT id INTO student12_id FROM students WHERE admission_number = 'ADM012' AND school_id = demo_school_id;
  SELECT id INTO student13_id FROM students WHERE admission_number = 'ADM013' AND school_id = demo_school_id;
  SELECT id INTO student14_id FROM students WHERE admission_number = 'ADM014' AND school_id = demo_school_id;
  SELECT id INTO student15_id FROM students WHERE admission_number = 'ADM015' AND school_id = demo_school_id;

  -- Fee structures
  INSERT INTO fee_structures (school_id, name, amount, academic_year_id) VALUES
    (demo_school_id, 'Tuition Fee - Form 1', 45000, demo_year_id) RETURNING id INTO fee_structure_id;

  -- Student accounts (fee balances)
  INSERT INTO student_accounts (school_id, student_id, fee_structure_id, amount_due, amount_paid) VALUES
    (demo_school_id, student1_id, fee_structure_id, 45000, 35000) RETURNING id INTO account1_id,
    (demo_school_id, student2_id, fee_structure_id, 45000, 45000) RETURNING id INTO account2_id,
    (demo_school_id, student3_id, fee_structure_id, 45000, 20000) RETURNING id INTO account3_id,
    (demo_school_id, student4_id, fee_structure_id, 45000, 45000) RETURNING id INTO account4_id,
    (demo_school_id, student5_id, fee_structure_id, 45000, 15000) RETURNING id INTO account5_id,
    (demo_school_id, student6_id, fee_structure_id, 45000, 45000) RETURNING id INTO account6_id,
    (demo_school_id, student7_id, fee_structure_id, 45000, 30000) RETURNING id INTO account7_id,
    (demo_school_id, student8_id, fee_structure_id, 45000, 45000) RETURNING id INTO account8_id,
    (demo_school_id, student9_id, fee_structure_id, 45000, 25000) RETURNING id INTO account9_id,
    (demo_school_id, student10_id, fee_structure_id, 45000, 45000) RETURNING id INTO account10_id,
    (demo_school_id, student11_id, fee_structure_id, 45000, 40000) RETURNING id INTO account11_id,
    (demo_school_id, student12_id, fee_structure_id, 45000, 45000) RETURNING id INTO account12_id,
    (demo_school_id, student13_id, fee_structure_id, 45000, 10000) RETURNING id INTO account13_id,
    (demo_school_id, student14_id, fee_structure_id, 45000, 45000) RETURNING id INTO account14_id,
    (demo_school_id, student15_id, fee_structure_id, 45000, 38000) RETURNING id INTO account15_id;

  -- Payments (some history)
  INSERT INTO payments (school_id, student_account_id, amount, payment_date, reference_number, recorded_by, notes) VALUES
    (demo_school_id, account1_id, 35000, '2026-01-10', 'PAY001', principal_id, 'First installment'),
    (demo_school_id, account3_id, 20000, '2026-01-12', 'PAY002', principal_id, 'Partial payment'),
    (demo_school_id, account5_id, 15000, '2026-01-15', 'PAY003', principal_id, 'First installment'),
    (demo_school_id, account7_id, 30000, '2026-01-18', 'PAY004', principal_id, 'Partial payment'),
    (demo_school_id, account9_id, 25000, '2026-01-20', 'PAY005', principal_id, 'First installment'),
    (demo_school_id, account11_id, 40000, '2026-01-22', 'PAY006', principal_id, 'Almost full'),
    (demo_school_id, account13_id, 10000, '2026-01-25', 'PAY007', principal_id, 'Deposit'),
    (demo_school_id, account15_id, 38000, '2026-01-28', 'PAY008', principal_id, 'Large payment');

  -- Attendance records (sample week)
  INSERT INTO attendance_records (school_id, student_id, date, status, recorded_by) VALUES
    (demo_school_id, student1_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student2_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student3_id, '2026-09-01', 'absent', teacher_id),
    (demo_school_id, student4_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student5_id, '2026-09-01', 'late', teacher_id),
    (demo_school_id, student6_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student7_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student8_id, '2026-09-01', 'excused', teacher_id),
    (demo_school_id, student9_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student10_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student11_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student12_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student13_id, '2026-09-01', 'absent', teacher_id),
    (demo_school_id, student14_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student15_id, '2026-09-01', 'present', teacher_id),
    (demo_school_id, student1_id, '2026-09-02', 'present', teacher_id),
    (demo_school_id, student2_id, '2026-09-02', 'late', teacher_id),
    (demo_school_id, student3_id, '2026-09-02', 'present', teacher_id),
    (demo_school_id, student4_id, '2026-09-02', 'present', teacher_id),
    (demo_school_id, student5_id, '2026-09-02', 'present', teacher_id);

  RAISE NOTICE 'Demo school created successfully with all portal users! School ID: %', demo_school_id;
END $$;
