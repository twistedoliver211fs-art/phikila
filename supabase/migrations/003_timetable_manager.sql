-- Add timetable_manager role (extends teacher with timetable builder access)

-- Update the enum
ALTER TYPE member_role ADD VALUE IF NOT EXISTS 'timetable_manager';
