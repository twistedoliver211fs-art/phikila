import { createAdminClient } from "@/lib/supabase/server-admin";

export interface Announcement {
  id: string;
  schoolId: string;
  authorId: string | null;
  title: string;
  content: string;
  isPublished: boolean;
  targetAudience: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

function mapAnnouncement(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    authorId: row.author_id as string | null,
    title: row.title as string,
    content: row.content as string,
    isPublished: row.is_published as boolean,
    targetAudience: (row.target_audience as string) ?? "all",
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? row.created_at as string,
    authorName: (row.author_name as string) ?? undefined,
  };
}

export async function getAnnouncements(
  schoolId: string,
  options?: { published?: boolean }
): Promise<Announcement[]> {
  const admin = createAdminClient();
  let query = admin
    .from("announcements")
    .select("*, profiles:author_id(full_name)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (options?.published !== undefined) {
    query = query.eq("is_published", options.published);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const profiles = row.profiles as Record<string, unknown> | null;
    return {
      ...mapAnnouncement(row),
      authorName: (profiles?.full_name as string) ?? "Unknown",
    };
  });
}

export async function createAnnouncement(params: {
  schoolId: string;
  authorId: string;
  title: string;
  content: string;
  isPublished: boolean;
  targetAudience: string;
}): Promise<Announcement> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("announcements")
    .insert({
      school_id: params.schoolId,
      author_id: params.authorId,
      title: params.title,
      content: params.content,
      is_published: params.isPublished,
      target_audience: params.targetAudience,
    })
    .select()
    .single();

  if (error) throw error;
  return mapAnnouncement(data);
}

export async function updateAnnouncement(
  announcementId: string,
  schoolId: string,
  params: {
    title?: string;
    content?: string;
    isPublished?: boolean;
    targetAudience?: string;
  }
): Promise<Announcement> {
  const admin = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (params.title !== undefined) updates.title = params.title;
  if (params.content !== undefined) updates.content = params.content;
  if (params.isPublished !== undefined) updates.is_published = params.isPublished;
  if (params.targetAudience !== undefined) updates.target_audience = params.targetAudience;

  const { data, error } = await admin
    .from("announcements")
    .update(updates)
    .eq("id", announcementId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return mapAnnouncement(data);
}

export async function deleteAnnouncement(
  announcementId: string,
  schoolId: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("announcements")
    .delete()
    .eq("id", announcementId)
    .eq("school_id", schoolId);

  if (error) throw error;
}
