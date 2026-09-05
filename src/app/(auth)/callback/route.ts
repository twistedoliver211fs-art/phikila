import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

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
  const turnstileToken = searchParams.get("t");

  // Optional explicit destination (e.g. /register/school when signing in as
  // part of school registration). Only relative paths starting with a single
  // "/" are allowed, to prevent open redirects.
  const next = searchParams.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  // Verify Turnstile token if present. `__no_captcha__` is only accepted when
  // the deployment has no site key configured (local dev); if a site key is
  // configured, it means the captcha was bypassed and the sign-in is rejected.
  const captchaConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  if (turnstileToken && turnstileToken !== "__no_captcha__") {
    const valid = await verifyTurnstileToken(turnstileToken);
    if (!valid) {
      return NextResponse.redirect(`${origin}/login?error=captcha_failed`);
    }
  } else if (captchaConfigured) {
    // Token missing or the placeholder "__no_captcha__" while captcha is
    // required — treat it as a failed security check.
    return NextResponse.redirect(`${origin}/login?error=captcha_failed`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (safeNext) {
          // The destination was chosen before signing in (e.g. the school
          // registration flow) — skip the role-based portal redirect.
          return NextResponse.redirect(`${origin}${safeNext}`);
        }

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
