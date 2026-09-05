import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { records } = body;
  if (!Array.isArray(records)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { error } = await supabase.from("attendance").upsert(
    records.map((r: Record<string, unknown>) => ({
      id: r.id,
      school_id: r.school_id,
      class_id: r.class_id,
      date: r.date,
      student_id: r.student_id,
      status: r.status,
      recorded_by: r.recorded_by,
    })),
    { onConflict: "id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, synced: records.length });
}
