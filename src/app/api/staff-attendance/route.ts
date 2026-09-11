import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getStaffAttendance, bulkRecordStaffAttendance } from "@/lib/services/staff-attendance";
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = createRoute(async ({ searchParams, user }) => {
  const date = searchParams.get("date");
  if (!date) {
    throw new ValidationError("date query parameter is required");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("active_school_id")
    .eq("id", user.id)
    .single();

  const schoolId = profile?.active_school_id;
  if (!schoolId) {
    throw new ForbiddenError("No active school");
  }

  const { data: member } = await admin
    .from("school_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .single();

  if (!member || !["principal", "super_admin"].includes(member.role)) {
    throw new ForbiddenError("Only principals can access staff attendance");
  }

  const [attendance, staffList] = await Promise.all([
    getStaffAttendance(schoolId, date),
    admin
      .from("staff")
      .select("id, first_name, last_name, role")
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .order("last_name"),
  ]);

  const attendanceMap = new Map(attendance.map((a) => [a.staffId, a]));
  const staff = (staffList.data ?? []).map((s) => ({
    ...s,
    attendance: attendanceMap.get(s.id) ?? null,
  }));

  return NextResponse.json({ staff, attendance });
});

export const POST = createRoute(async ({ request, user }) => {
  const body = await request.json();
  const { date, records } = body as {
    date: string;
    records: { staffId: string; status: string; notes?: string }[];
  };

  if (!date || !Array.isArray(records)) {
    throw new ValidationError("date and records array are required");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("active_school_id")
    .eq("id", user.id)
    .single();

  const schoolId = profile?.active_school_id;
  if (!schoolId) {
    throw new ForbiddenError("No active school");
  }

  const { data: member } = await admin
    .from("school_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .single();

  if (!member || !["principal", "super_admin"].includes(member.role)) {
    throw new ForbiddenError("Only principals can record staff attendance");
  }

  const result = await bulkRecordStaffAttendance(
    schoolId,
    records.map((r) => ({
      staffId: r.staffId,
      status: r.status as "present" | "absent" | "late" | "excused" | "on_leave",
      notes: r.notes,
    })),
    date,
    user.id
  );

  return NextResponse.json({ records: result }, { status: 201 });
});
