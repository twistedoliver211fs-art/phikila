import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getChildrenForParent } from "@/lib/services/parent";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export const GET = createRoute(async ({ user }) => {
  const schoolId = await getCurrentSchoolId();
  const children = await getChildrenForParent(user.id, schoolId ?? undefined);
  return NextResponse.json({ children });
});
