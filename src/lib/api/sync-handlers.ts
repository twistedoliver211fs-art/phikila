import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  sanitizeAttendanceRecords,
  sanitizeMarkRecords,
} from "@/lib/sync-payload";
import {
  STAFF_ROLES_CAN_SYNC_ATTENDANCE,
  STAFF_ROLES_CAN_SYNC_MARKS,
} from "@/lib/membership";

function tooMany(rl: { resetAt: number }) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    }
  );
}

export async function handleAttendanceSync(request: Request) {
  const rl = rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: "sync-attendance" });
  if (!rl.allowed) return tooMany(rl);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: memberships } = await supabase
    .from("school_members")
    .select("school_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const canWrite = (memberships ?? []).filter((m) =>
    (STAFF_ROLES_CAN_SYNC_ATTENDANCE as readonly string[]).includes(m.role)
  );
  if (canWrite.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const records = sanitizeAttendanceRecords(
    (body as { records?: unknown })?.records,
    {
      allowedSchoolIds: new Set(canWrite.map((m) => m.school_id)),
      userId: user.id,
    }
  );

  if (records.length === 0) {
    return NextResponse.json({ error: "No valid attendance records" }, { status: 400 });
  }

  const { error } = await supabase.from("attendance_records").upsert(records, {
    onConflict: "student_id,date",
  });

  if (error) return NextResponse.json({ error: "Failed to sync attendance" }, { status: 500 });
  return NextResponse.json({ ok: true, synced: records.length });
}

export async function handleMarksSync(request: Request) {
  const rl = rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: "sync-marks" });
  if (!rl.allowed) return tooMany(rl);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: memberships } = await supabase
    .from("school_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const allowed = (memberships ?? []).some((m) =>
    (STAFF_ROLES_CAN_SYNC_MARKS as readonly string[]).includes(m.role)
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const records = sanitizeMarkRecords((body as { records?: unknown })?.records, {
    userId: user.id,
  });

  if (records.length === 0) {
    return NextResponse.json({ error: "No valid mark records" }, { status: 400 });
  }

  const { error } = await supabase.from("exam_results").upsert(records, {
    onConflict: "exam_id,student_id,subject_id",
  });

  if (error) return NextResponse.json({ error: "Failed to sync marks" }, { status: 500 });
  return NextResponse.json({ ok: true, synced: records.length });
}
