/**
 * Server-side Cloudflare Turnstile token verification.
 *
 * Required env (either):
 *   TURNSTILE_SECRET_KEY
 *   SUPABASE_CAPTCHA_SECRET
 */

function getTurnstileSecret(): string | undefined {
  return process.env.TURNSTILE_SECRET_KEY || process.env.SUPABASE_CAPTCHA_SECRET;
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = getTurnstileSecret();
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY / SUPABASE_CAPTCHA_SECRET is not set.");
    return false;
  }

  if (!token || token === "__no_captcha__") {
    return false;
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const json = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!json.success) {
      console.error("[turnstile] Verification failed:", json["error-codes"]);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[turnstile] siteverify request failed:", err);
    return false;
  }
}
