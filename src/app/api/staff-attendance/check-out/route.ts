import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
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

  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await admin
    .from("staff_attendance")
    .select("id, check_in_time")
    .eq("school_id", schoolId)
    .eq("staff_id", staff.id)
    .eq("date", today)
    .single();

  if (!existing || !existing.check_in_time) {
    throw new ForbiddenError("You must check in first before checking out");
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("staff_attendance")
    .update({
      check_out_time: now,
      updated_at: now,
    })
    .eq("id", existing.id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ record: data });
});
