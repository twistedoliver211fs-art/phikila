import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { getMessages, getUnreadCount, sendMessage } from "@/lib/services/message";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const GET = createRoute(async ({ user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ messages: [], unreadCount: 0 });
  }

  const messages = await getMessages(schoolId, user.id);
  const unreadCount = await getUnreadCount(schoolId, user.id);
  return NextResponse.json({ messages, unreadCount });
});

export const POST = createRoute(async ({ request, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { recipientId, subject, content } = body;

  if (!content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  let targetRecipientId = recipientId;

  if (!targetRecipientId) {
    const admin = createAdminClient();
    const { data: member } = await admin
      .from("school_members")
      .select("user_id")
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .in("role", ["principal", "secretary"])
      .order("role", { ascending: true })
      .limit(1)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: "No school administrator found" },
        { status: 400 }
      );
    }
    targetRecipientId = member.user_id;
  }

  const message = await sendMessage({
    schoolId,
    senderId: user.id,
    recipientId: targetRecipientId,
    subject,
    content,
  });

  return NextResponse.json({ message }, { status: 201 });
});
