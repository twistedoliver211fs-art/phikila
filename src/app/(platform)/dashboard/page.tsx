import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { portalRoutes, resolvePortalRole } from "@/lib/auth-config";

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
    .select("role, school_id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  let role = members?.[0]?.role;

  // Multi-school users: route by the role in their active school.
  if ((members?.length ?? 0) > 1) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_school_id")
      .eq("id", user.id)
      .maybeSingle();

    const cookieStore = await cookies();
    role =
      resolvePortalRole(
        members ?? [],
        profile?.active_school_id,
        cookieStore.get("decimal_active_role")?.value ?? null
      ) ?? role;
  }

  if (!role) {
    redirect("/no-access");
  }

  redirect(portalRoutes[role] ?? "/teacher");
}
