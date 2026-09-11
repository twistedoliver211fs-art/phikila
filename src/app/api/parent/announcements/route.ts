import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const GET = createRoute(async ({ user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ announcements: [] });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("announcements")
    .select("id, title, content, target_audience, is_published, created_at, profiles:author_id(full_name)")
    .eq("school_id", schoolId)
    .eq("is_published", true)
    .or("target_audience.eq.all,target_audience.eq.parents")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const announcements = (data ?? []).map((a) => {
    const author = a.profiles as unknown as Record<string, unknown> | null;
    return {
      id: a.id as string,
      title: a.title as string,
      content: a.content as string,
      targetAudience: a.target_audience as string,
      createdAt: a.created_at as string,
      authorName: (author?.full_name as string) ?? "Unknown",
    };
  });

  return NextResponse.json({ announcements });
});
