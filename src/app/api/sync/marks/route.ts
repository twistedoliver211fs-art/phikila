import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { records } = body;
  if (!Array.isArray(records)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { error } = await supabase.from("exam_results").upsert(
    records.map((r: Record<string, unknown>) => ({
      id: r.id,
      exam_id: r.exam_id,
      student_id: r.student_id,
      subject_id: r.subject_id,
      score: r.score,
      recorded_by: r.recorded_by,
    })),
    { onConflict: "id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, synced: records.length });
}
