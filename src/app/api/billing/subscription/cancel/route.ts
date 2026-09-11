import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { cancelSubscription } from "@/lib/billing/subscription";
import { ValidationError } from "@/lib/errors";

export const PATCH = createRoute(
  async ({ request, user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "manage");

  const body = await request.json();
  const { immediate } = body as { immediate?: boolean };

  if (typeof immediate !== "boolean") {
    throw new ValidationError("immediate must be a boolean");
  }

  await cancelSubscription(ctx.schoolId, immediate);

  return NextResponse.json({ ok: true });
},
  { rateLimit: { maxRequests: 5, windowMs: 60_000, prefix: "billing:cancel" } }
);
