import { createClient } from "@/lib/supabase/server";

export async function getCurrentSchoolId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  return data?.school_id ?? null;
}
