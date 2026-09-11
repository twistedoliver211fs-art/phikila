import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { getPreferences, updatePreference } from "@/lib/services/notification";

export const GET = createRoute(async ({ user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }
  const preferences = await getPreferences(user.id, schoolId);
  return NextResponse.json({ preferences });
});

export const POST = createRoute(async ({ request, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { channel, eventType, isEnabled } = body;

  if (!channel || !eventType || typeof isEnabled !== "boolean") {
    return NextResponse.json(
      { error: "channel, eventType, and isEnabled are required" },
      { status: 400 }
    );
  }

  const preference = await updatePreference({
    userId: user.id,
    schoolId,
    channel,
    eventType,
    isEnabled,
  });

  return NextResponse.json({ preference });
});
