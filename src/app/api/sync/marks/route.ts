import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { syncMarkRecords } from "@/lib/services/sync";

export async function POST(request: Request) {
  const rl = await rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: "sync-marks" });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { records } = body;
  if (!Array.isArray(records)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_school_id")
    .eq("id", user.id)
    .maybeSingle();
  const schoolId = profile?.active_school_id;
  if (!schoolId) return NextResponse.json({ error: "No active school" }, { status: 403 });

  try {
    const result = await syncMarkRecords(supabase, schoolId, user.id, records);
    return NextResponse.json({
      ok: true,
      synced: result.synced,
      skipped: result.skipped,
      conflicts: result.conflicts,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
