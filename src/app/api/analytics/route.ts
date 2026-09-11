import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { getDashboardStats, getEnrollmentTrend, getAttendanceTrend, getRevenueTrend, getClassPerformance } from "@/lib/services/analytics";

export const GET = createRoute(async ({ searchParams }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const view = searchParams.get("view") ?? "stats";

  switch (view) {
    case "enrollment":
      return NextResponse.json({ trend: await getEnrollmentTrend(schoolId) });
    case "attendance":
      return NextResponse.json({ trend: await getAttendanceTrend(schoolId) });
    case "revenue":
      return NextResponse.json({ trend: await getRevenueTrend(schoolId) });
    case "performance":
      return NextResponse.json({ classes: await getClassPerformance(schoolId) });
    default:
      return NextResponse.json({ stats: await getDashboardStats(schoolId) });
  }
});
