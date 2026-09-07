import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlatformShell } from "@/components/platform/shell";
import { pickPrimaryMembership } from "@/lib/membership";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  principal: "Principal",
  teacher: "Teacher",
  timetable_manager: "Timetable Manager",
  finance: "Finance",
  admissions_officer: "Admissions Officer",
  secretary: "Secretary",
  parent: "Parent",
};

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const primary = pickPrimaryMembership(members);
  if (!primary) {
    redirect("/no-access");
  }

  const role = primary.role;
  const roleLabel = roleLabels[role] ?? "User";

  return (
    <PlatformShell role={role} roleLabel={roleLabel} userName={user.email ?? ""}>
      {children}
    </PlatformShell>
  );
}
