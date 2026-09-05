import { NextResponse } from "next/server";

// Cloudflare Turnstile siteverify endpoint.
// Turnstile is already enabled in config.toml ([auth.captcha]), so GoTrue
// enforces it on signup / magic-link / OTP endpoints server-side. This route
// is a secondary verification point for any app-level form that wants to
// prove a human solved the widget before proceeding (e.g. future email
// sign-up, contact forms, admission applications).
//
// Required env (add to .env.local):
//   SUPABASE_CAPTCHA_SECRET  — the Turnstile secret key from
//   https://dash.cloudflare.com/?to=/:account/captcha (matching the secret
//   already set in config.toml).
//
// The site key that the client widget uses is NEXT_PUBLIC_TURNSTILE_SITE_KEY
// (public, safe to ship in the browser bundle).

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  const siteUrl = body?.siteUrl ?? "https://phikila-app.vercel.app";

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid captcha token." },
      { status: 400 }
    );
  }

  const secret = process.env.SUPABASE_CAPTCHA_SECRET;
  if (!secret) {
    console.error("[captcha-verify] SUPABASE_CAPTCHA_SECRET is not set.");
    return NextResponse.json(
      { ok: false, error: "Captcha verification is not configured." },
      { status: 500 }
    );
  }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
          site_url: siteUrl,
          // Pass the site key when available so Cloudflare can detect
          // widget-vs-environment mismatches.
          ...(siteKey ? { site_key: siteKey } : {}),
        }),
      }
    );

    const json = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!json.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Captcha verification failed.",
          codes: json["error-codes"] ?? [],
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[captcha-verify] siteverify request failed:", err);
    return NextResponse.json(
      { ok: false, error: "Captcha verification service unavailable." },
      { status: 502 }
    );
  }
}
