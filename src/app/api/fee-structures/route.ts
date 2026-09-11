import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const GET = createRoute(async ({ user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "read");

  const admin = createAdminClient();
  const { data: structures } = await admin
    .from("fee_structures")
    .select("id, name, amount")
    .eq("school_id", ctx.schoolId)
    .order("name", { ascending: true });

  return NextResponse.json({ feeStructures: structures ?? [] });
});
