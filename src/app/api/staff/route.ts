import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const GET = createRoute(async ({ user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: members, error } = await admin
    .from("school_members")
    .select("user_id, role, profiles:user_id(full_name, email)")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .neq("user_id", user.id);

  if (error) throw error;

  const staff = (members ?? [])
    .map((m: Record<string, unknown>) => {
      const profile = m.profiles as Record<string, unknown> | null;
      return {
        userId: m.user_id as string,
        name: (profile?.full_name as string) ?? "Unknown",
        email: (profile?.email as string) ?? "",
        role: m.role as string,
      };
    })
    .filter((s) => s.name !== "Unknown");

  return NextResponse.json({ staff });
});
