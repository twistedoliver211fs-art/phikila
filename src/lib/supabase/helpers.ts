import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

/**
 * Get the current user's active school ID.
 *
 * Resolution order:
 *  1. profiles.active_school_id (explicit selection)
 *  2. First active school_members row (fallback)
 *
 * Returns null if the user has no active school membership.
 */
export async function getCurrentSchoolId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try explicit active school first
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_school_id")
    .eq("id", user.id)
    .single();

  if (profile?.active_school_id) {
    // Verify the membership is still active
    const { data: member } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("user_id", user.id)
      .eq("school_id", profile.active_school_id)
      .eq("is_active", true)
      .single();

    if (member) return member.school_id;
  }

  // Fallback: get first active membership
  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("joined_at", { ascending: true })
    .limit(1)
    .single();

  if (!member) return null;

  // Auto-set active_school_id for future calls
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ active_school_id: member.school_id })
    .eq("id", user.id);

  return member.school_id;
}
