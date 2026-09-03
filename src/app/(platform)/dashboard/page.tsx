import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const portalRoutes: Record<string, string> = {
  super_admin: "/super-admin",
  principal: "/principal",
  teacher: "/teacher",
  finance: "/principal",
  admissions_officer: "/principal",
  secretary: "/principal",
  parent: "/parent",
};

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
    .eq("is_active", true)
    .limit(1);

  const role = members?.[0]?.role;

  if (!role) {
    redirect("/no-access");
  }

  const route = portalRoutes[role] ?? "/teacher";
  redirect(route);
}
