import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { getSubscription } from "@/lib/billing/subscription";
import { getUsageStats } from "@/lib/billing/usage";
import { getEntitlements } from "@/lib/billing/entitlements";
import { getPlanById } from "@/lib/billing/plans";
import { NotFoundError } from "@/lib/errors";

export const GET = createRoute(async ({ user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "read");

  const subscription = await getSubscription(ctx.schoolId);
  if (!subscription) {
    return NextResponse.json({
      subscription: null,
      plan: null,
      usage: null,
      entitlements: null,
    });
  }

  const plan = await getPlanById(subscription.planId);
  const usage = await getUsageStats(ctx.schoolId);
  const entitlements = await getEntitlements(ctx.schoolId);

  return NextResponse.json({
    subscription,
    plan,
    usage,
    entitlements,
  });
});
