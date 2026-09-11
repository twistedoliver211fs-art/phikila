import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const rl = await rateLimit(new Request("http://localhost"), { maxRequests: 10, windowMs: 60_000, prefix: "signout" });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
  );
  response.cookies.delete("decimal_active_role");
  response.cookies.delete("decimal_school_mode");
  return response;
}
