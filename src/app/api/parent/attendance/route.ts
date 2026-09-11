import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getStudentAttendanceForParent } from "@/lib/services/parent";
import { ForbiddenError } from "@/lib/errors";

export const GET = createRoute(async ({ searchParams, user }) => {
  const studentId = searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: link } = await admin
    .from("parent_student_relationships")
    .select("id")
    .eq("parent_user_id", user.id)
    .eq("student_id", studentId)
    .eq("is_active", true)
    .single();

  if (!link) {
    throw new ForbiddenError("You are not authorized to view this student's data");
  }

  const attendance = await getStudentAttendanceForParent(studentId, 30);
  return NextResponse.json({ attendance });
});
