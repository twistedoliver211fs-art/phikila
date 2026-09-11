import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/services/announcement";

export const GET = createRoute(async ({ searchParams }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const published = searchParams.get("published");
  const announcements = await getAnnouncements(schoolId, {
    published: published === "true" ? true : published === "false" ? false : undefined,
  });
  return NextResponse.json({ announcements });
});

export const POST = createRoute(async ({ request, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { title, content, isPublished, targetAudience } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    );
  }

  const announcement = await createAnnouncement({
    schoolId,
    authorId: user.id,
    title,
    content,
    isPublished: isPublished ?? false,
    targetAudience: targetAudience ?? "all",
  });

  return NextResponse.json({ announcement }, { status: 201 });
});

export const PUT = createRoute(async ({ request, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { id, title, content, isPublished, targetAudience } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const announcement = await updateAnnouncement(id, schoolId, {
    title,
    content,
    isPublished,
    targetAudience,
  });

  return NextResponse.json({ announcement });
});

export const DELETE = createRoute(async ({ request }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await deleteAnnouncement(id, schoolId);
  return NextResponse.json({ success: true });
});
