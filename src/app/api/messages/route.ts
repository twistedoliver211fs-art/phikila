import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { getMessages, getUnreadCount, sendMessage } from "@/lib/services/message";

export const GET = createRoute(async ({ user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
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
  const { recipientId, subject, content, conversationId } = body;

  if (!recipientId || !content) {
    return NextResponse.json(
      { error: "recipientId and content are required" },
      { status: 400 }
    );
  }

  const message = await sendMessage({
    schoolId,
    senderId: user.id,
    recipientId,
    subject,
    content,
    conversationId,
  });

  return NextResponse.json({ message }, { status: 201 });
});
