import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { portalRoutes, resolvePortalRole } from "@/lib/auth-config";

async function resolveAndRedirect(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  userId: string,
  origin: string
) {
  const { data: members } = await supabase
    .from("school_members")
    .select("role, school_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("joined_at", { ascending: true });

  if (!members || members.length === 0) {
    return NextResponse.redirect(`${origin}/no-access`);
  }

  if (members.length === 1) {
    const role = members[0].role;
    return NextResponse.redirect(`${origin}${portalRoutes[role] ?? "/teacher"}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_school_id")
    .eq("id", userId)
    .maybeSingle();

  const cookieStore = await cookies();
  const preferredRole =
    cookieStore.get("decimal_active_role")?.value ?? null;
  const activeRole = resolvePortalRole(
    members,
    profile?.active_school_id,
    preferredRole
  );

  if (activeRole) {
    return NextResponse.redirect(`${origin}${portalRoutes[activeRole] ?? "/teacher"}`);
  }

  return NextResponse.redirect(`${origin}/school-picker`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const next = searchParams.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
          return NextResponse.redirect(`${origin}/mfa/verify`)
        }

        if (safeNext) {
          return NextResponse.redirect(`${origin}${safeNext}`);
        }

        return await resolveAndRedirect(supabase, user.id, origin);
      }
    }
  }

  // No code — check for an existing session (email/password login).
  // The client calls router.push("/callback") after signInWithPassword();
  // the session is already in cookies, so we can resolve directly.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
      return NextResponse.redirect(`${origin}/mfa/verify`)
    }

    if (safeNext) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    return await resolveAndRedirect(supabase, user.id, origin);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
