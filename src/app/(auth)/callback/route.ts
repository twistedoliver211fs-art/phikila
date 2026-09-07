import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { pickPrimaryMembership, portalForRole } from "@/lib/membership";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const turnstileToken = searchParams.get("t");

  const next = searchParams.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const captchaConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  if (captchaConfigured) {
    if (!turnstileToken || turnstileToken === "__no_captcha__") {
      return NextResponse.redirect(`${origin}/login?error=captcha_failed`);
    }
    const valid = await verifyTurnstileToken(turnstileToken);
    if (!valid) {
      return NextResponse.redirect(`${origin}/login?error=captcha_failed`);
    }
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
          return NextResponse.redirect(`${origin}${safeNext}`);
        }

        const { data: members } = await supabase
          .from("school_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("is_active", true);

        const role = pickPrimaryMembership(members)?.role;
        if (role) {
          return NextResponse.redirect(`${origin}${portalForRole(role)}`);
        }

        return NextResponse.redirect(`${origin}/no-access`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
