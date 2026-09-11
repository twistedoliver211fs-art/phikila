import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { recordStaffAttendance } from "@/lib/services/staff-attendance";
import { ForbiddenError } from "@/lib/errors";

export const POST = createRoute(async ({ user }) => {
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

  const { data: staff } = await admin
    .from("staff")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!staff) {
    throw new ForbiddenError("You are not an active staff member at this school");
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const hour = now.getHours();
  const status = hour >= 8 ? "late" : "present";

  const { data: existing } = await admin
    .from("staff_attendance")
    .select("id")
    .eq("school_id", schoolId)
    .eq("staff_id", staff.id)
    .eq("date", today)
    .single();

  if (existing) {
    const { data, error } = await admin
      .from("staff_attendance")
      .update({
        check_in_time: now.toISOString(),
        status,
        updated_at: now.toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ record: data });
  }

  const record = await recordStaffAttendance(
    schoolId,
    staff.id,
    today,
    status,
    user.id
  );

  const { error: updateError } = await admin
    .from("staff_attendance")
    .update({ check_in_time: now.toISOString() })
    .eq("id", record.id);

  if (updateError) throw updateError;

  return NextResponse.json({ record: { ...record, checkInTime: now.toISOString() } });
});
