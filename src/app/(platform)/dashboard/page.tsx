import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickPrimaryMembership, portalForRole } from "@/lib/membership";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: members } = await supabase
    .from("school_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const role = pickPrimaryMembership(members)?.role;
  redirect(portalForRole(role));
}
