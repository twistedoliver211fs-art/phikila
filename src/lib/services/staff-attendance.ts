import { createAdminClient } from "@/lib/supabase/server-admin";

export interface StaffAttendanceRecord {
  id: string;
  schoolId: string;
  staffId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused" | "on_leave";
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAttendanceStats {
  staffId: string;
  firstName: string;
  lastName: string;
  role: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  onLeave: number;
  attendanceRate: number;
}

function mapRecord(row: Record<string, unknown>): StaffAttendanceRecord {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    staffId: row.staff_id as string,
    date: row.date as string,
    status: row.status as StaffAttendanceRecord["status"],
    checkInTime: row.check_in_time as string | null,
    checkOutTime: row.check_out_time as string | null,
    notes: row.notes as string | null,
    recordedBy: row.recorded_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getStaffAttendance(
  schoolId: string,
  date: string
): Promise<StaffAttendanceRecord[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("staff_attendance")
    .select("*")
    .eq("school_id", schoolId)
    .eq("date", date);

  if (error) throw error;
  return (data ?? []).map(mapRecord);
}

export async function recordStaffAttendance(
  schoolId: string,
  staffId: string,
  date: string,
  status: StaffAttendanceRecord["status"],
  recordedBy: string,
  notes?: string
): Promise<StaffAttendanceRecord> {
  const admin = createAdminClient();

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("staff_attendance")
    .upsert(
      {
        school_id: schoolId,
        staff_id: staffId,
        date,
        status,
        notes: notes ?? null,
        recorded_by: recordedBy,
        updated_at: now,
      },
      { onConflict: "school_id,staff_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return mapRecord(data);
}

export async function bulkRecordStaffAttendance(
  schoolId: string,
  records: { staffId: string; status: StaffAttendanceRecord["status"]; notes?: string }[],
  date: string,
  recordedBy: string
): Promise<StaffAttendanceRecord[]> {
  const admin = createAdminClient();

  const now = new Date().toISOString();
  const rows = records.map((r) => ({
    school_id: schoolId,
    staff_id: r.staffId,
    date,
    status: r.status,
    notes: r.notes ?? null,
    recorded_by: recordedBy,
    updated_at: now,
  }));

  const { data, error } = await admin
    .from("staff_attendance")
    .upsert(rows, { onConflict: "school_id,staff_id,date" })
    .select();

  if (error) throw error;
  return (data ?? []).map(mapRecord);
}

export async function getStaffAttendanceStats(
  schoolId: string,
  startDate: string,
  endDate: string
): Promise<StaffAttendanceStats[]> {
  const admin = createAdminClient();

  const { data: staffList, error: staffError } = await admin
    .from("staff")
    .select("id, first_name, last_name, role")
    .eq("school_id", schoolId)
    .eq("is_active", true);

  if (staffError) throw staffError;

  const { data: attendanceData, error: attError } = await admin
    .from("staff_attendance")
    .select("staff_id, status")
    .eq("school_id", schoolId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (attError) throw attError;

  const byStaff: Record<string, Record<string, number>> = {};
  (attendanceData ?? []).forEach((row) => {
    if (!byStaff[row.staff_id]) {
      byStaff[row.staff_id] = { present: 0, absent: 0, late: 0, excused: 0, on_leave: 0 };
    }
    byStaff[row.staff_id][row.status] = (byStaff[row.staff_id][row.status] || 0) + 1;
  });

  return (staffList ?? []).map((s) => {
    const stats = byStaff[s.id] ?? { present: 0, absent: 0, late: 0, excused: 0, on_leave: 0 };
    const totalDays = stats.present + stats.absent + stats.late + stats.excused + stats.onLeave;
    return {
      staffId: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      role: s.role,
      totalDays,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      excused: stats.excused,
      onLeave: stats.on_leave,
      attendanceRate: totalDays > 0 ? ((stats.present + stats.late) / totalDays) * 100 : 0,
    };
  });
}
