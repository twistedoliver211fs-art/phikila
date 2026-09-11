import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const GET = createRoute(async ({ user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "students", "read");

  const admin = createAdminClient();
  const { data: students } = await admin
    .from("students")
    .select("id, first_name, last_name, class_id, classes(id, name, grades(name))")
    .eq("school_id", ctx.schoolId)
    .eq("is_active", true)
    .order("first_name", { ascending: true });

  return NextResponse.json({ students: students ?? [] });
});
