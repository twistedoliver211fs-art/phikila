import { createClient } from "@/lib/supabase/server";
import { pickPrimaryMembership } from "@/lib/membership";

export async function getCurrentMembership(): Promise<{
  schoolId: string;
  role: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("school_members")
    .select("school_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const primary = pickPrimaryMembership(data);
  if (!primary) return null;

  return { schoolId: primary.school_id, role: primary.role };
}

export async function getCurrentSchoolId(): Promise<string | null> {
  const membership = await getCurrentMembership();
  return membership?.schoolId ?? null;
}
