import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { portalRoutes } from "@/lib/auth-config";
import { SchoolPicker } from "./school-picker-client";

export default async function SchoolPickerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: members } = await supabase
    .from("school_members")
    .select("role, school_id, schools(name, slug)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("joined_at", { ascending: true });

  if (!members || members.length === 0) {
    redirect("/no-access");
  }

  // Single-school users never need the picker — route them straight in.
  if (members.length === 1) {
    redirect(portalRoutes[members[0].role] ?? "/teacher");
  }

  return (
    <SchoolPicker
      members={members.map((m) => ({
        role: m.role,
        schoolId: m.school_id,
        schoolName:
          (Array.isArray(m.schools) ? m.schools[0] : m.schools)?.name ?? null,
      }))}
      email={user.email ?? ""}
    />
  );
}