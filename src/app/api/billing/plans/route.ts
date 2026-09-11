import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getPlans } from "@/lib/billing/plans";

export const GET = createRoute(async () => {
  const plans = await getPlans();
  return NextResponse.json({ plans });
});
