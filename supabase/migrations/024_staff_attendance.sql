CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'on_leave')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, staff_id, date)
);

ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff attendance viewable by school members" ON staff_attendance
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM school_members WHERE user_id = auth.uid() AND is_active = true)
    OR is_super_admin()
  );

CREATE POLICY "Staff attendance insertable by principal" ON staff_attendance
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM school_members WHERE user_id = auth.uid() AND role IN ('principal', 'super_admin') AND is_active = true)
  );

CREATE POLICY "Staff attendance updatable by principal" ON staff_attendance
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM school_members WHERE user_id = auth.uid() AND role IN ('principal', 'super_admin') AND is_active = true)
  );
