/**
 * Server-side Cloudflare Turnstile token verification.
 *
 * Calls the Cloudflare siteverify endpoint to validate a Turnstile response
 * token. Returns true if the token is valid, false otherwise.
 *
 * Required env: TURNSTILE_SECRET_KEY (server-only)
 */

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set.");
    return false;
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
        }),
      }
    );

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
