import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const portalRoutes: Record<string, string> = {
  super_admin: "/super-admin",
  principal: "/principal",
  teacher: "/teacher",
  timetable_manager: "/teacher",
  finance: "/finance",
  admissions_officer: "/admissions-officer",
  secretary: "/secretary",
  parent: "/parent",
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: members } = await supabase
          .from("school_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .limit(1);

        const role = members?.[0]?.role;

        if (role) {
          return NextResponse.redirect(`${origin}${portalRoutes[role] ?? "/teacher"}`);
        }

        return NextResponse.redirect(`${origin}/no-access`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
