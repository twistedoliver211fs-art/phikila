import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  const rl = rateLimit(request, { maxRequests: 20, windowMs: 60_000, prefix: "captcha-verify" });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = await request.json().catch(() => null);
  const token = body?.token;

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid captcha token." },
      { status: 400 }
    );
  }

  const valid = await verifyTurnstileToken(token);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Captcha verification failed." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
