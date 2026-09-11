import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { getUsageStats } from "@/lib/billing/usage";

export const GET = createRoute(async ({ user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "read");

  const usage = await getUsageStats(ctx.schoolId);

  return NextResponse.json({ usage });
});
