import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { upgradeSubscription, downgradeSubscription } from "@/lib/billing/subscription";
import { checkLimit } from "@/lib/billing/usage";
import { getPlanBySlug } from "@/lib/billing/plans";
import { ValidationError, NotFoundError } from "@/lib/errors";

export const POST = createRoute(
  async ({ request, user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "manage");

  const body = await request.json();
  const { planSlug } = body as { planSlug?: string };

  if (!planSlug || typeof planSlug !== "string") {
    throw new ValidationError("planSlug is required");
  }

  const targetPlan = await getPlanBySlug(planSlug);
  if (!targetPlan) {
    throw new NotFoundError(`Plan: ${planSlug}`);
  }

  // Check if this is an upgrade or downgrade by comparing with current plan
  const { getSubscription } = await import("@/lib/billing/subscription");
  const { getPlanById } = await import("@/lib/billing/plans");

  const currentSub = await getSubscription(ctx.schoolId);
  if (currentSub) {
    const currentPlan = await getPlanById(currentSub.planId);
    if (currentPlan) {
      if (targetPlan.sortOrder > currentPlan.sortOrder) {
        // Upgrade
        const sub = await upgradeSubscription(ctx.schoolId, planSlug);
        return NextResponse.json({ ok: true, subscription: sub, action: "upgrade" });
      } else if (targetPlan.sortOrder < currentPlan.sortOrder) {
        // Downgrade — check usage limits first
        const studentCheck = await checkLimit(ctx.schoolId, "students");
        if (!studentCheck.within) {
          throw new ValidationError(
            `Cannot downgrade: ${studentCheck.current} students exceeds ${planSlug} limit of ${studentCheck.limit}`
          );
        }

        const staffCheck = await checkLimit(ctx.schoolId, "staff");
        if (!staffCheck.within) {
          throw new ValidationError(
            `Cannot downgrade: ${staffCheck.current} staff exceeds ${planSlug} limit of ${staffCheck.limit}`
          );
        }

        const sub = await downgradeSubscription(ctx.schoolId, planSlug);
        return NextResponse.json({ ok: true, subscription: sub, action: "downgrade" });
      } else {
        throw new ValidationError("Already on this plan");
      }
    }
  }

  throw new NotFoundError("Active subscription");
},
  { rateLimit: { maxRequests: 5, windowMs: 60_000, prefix: "billing:checkout" } }
);
