import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { markAsRead } from "@/lib/services/message";

export const POST = createRoute(async ({ request, user }) => {
  const body = await request.json();
  const { messageId } = body;

  if (!messageId) {
    return NextResponse.json(
      { error: "messageId is required" },
      { status: 400 }
    );
  }

  await markAsRead(messageId, user.id);
  return NextResponse.json({ success: true });
});
