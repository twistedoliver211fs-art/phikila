import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  JUNIOR_SCHOOL_SUBJECTS,
  SENIOR_SCHOOL_SUBJECTS,
} from "@/lib/cbc-subjects";

/**
 * Onboarding wizard API. Creates the academic structure a school needs
 * before day one: academic year + terms, grades + classes, subjects,
 * periods, and fee structures. All writes go to the caller's active
 * school (session-scoped); the caller must hold an active principal
 * membership in that school (covers super admins operating via Enter
 * School, since they hold a temp principal membership too).
 */

type Step =
  | "academic-year"
  | "grades-classes"
  | "subjects"
  | "periods"
  | "fees"
  | "complete";

const STEP_PROGRESS: Record<Step, number> = {
  "academic-year": 20,
  "grades-classes": 40,
  subjects: 60,
  periods: 80,
  fees: 100,
  complete: 100,
};

const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const asDate = (v: unknown): string | null => {
  const s = asString(v);
  if (!s || Number.isNaN(Date.parse(s))) return null;
  return s.slice(0, 10);
};

export async function POST(request: Request) {
  const rl = await rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: "onboarding" });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_school_id")
    .eq("id", user.id)
    .maybeSingle();
  const schoolId = profile?.active_school_id;
  if (!schoolId) return NextResponse.json({ error: "No active school" }, { status: 403 });

  const { data: membership } = await supabase
    .from("school_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("school_id", schoolId)
    .eq("role", "principal")
    .eq("is_active", true)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const step = body?.step as Step;
  if (!step || !(step in STEP_PROGRESS)) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  try {
    let result: Record<string, unknown> = {};

    switch (step) {
      case "academic-year": {
        const yearName = asString(body.yearName);
        const startDate = asDate(body.startDate);
        const endDate = asDate(body.endDate);
        if (!yearName || !startDate || !endDate || endDate <= startDate) {
          return NextResponse.json({ error: "Invalid academic year" }, { status: 400 });
        }
        const terms = Array.isArray(body.terms) ? body.terms.slice(0, 4) : [];
        const parsedTerms = terms
          .map((t: Record<string, unknown>) => ({
            name: asString(t?.name),
            start_date: asDate(t?.startDate),
            end_date: asDate(t?.endDate),
          }))
          .filter((t: { name: string | null; start_date: string | null; end_date: string | null }) =>
            t.name && t.start_date && t.end_date && t.end_date > t.start_date
          );
        if (parsedTerms.length === 0) {
          return NextResponse.json({ error: "At least one valid term is required" }, { status: 400 });
        }

        const { data: year, error } = await supabase
          .from("academic_years")
          .insert({ school_id: schoolId, name: yearName, start_date: startDate, end_date: endDate, is_current: true })
          .select("id")
          .single();
        if (error) throw new Error(error.message);

        const { error: termsError } = await supabase.from("terms").insert(
          parsedTerms.map((t: { name: string; start_date: string; end_date: string }, i: number) => ({
            academic_year_id: year.id,
            name: t.name,
            start_date: t.start_date,
            end_date: t.end_date,
            is_current: i === 0,
          }))
        );
        if (termsError) throw new Error(termsError.message);
        result = { academicYearId: year.id, terms: parsedTerms.length };
        break;
      }

      case "grades-classes": {
        const grades = Array.isArray(body.grades) ? body.grades.slice(0, 20) : [];
        const parsed = grades
          .map((g: Record<string, unknown>) => ({
            name: asString(g?.name),
            level: typeof g?.level === "number" ? g.level : null,
            classes: (Array.isArray(g?.classes) ? g.classes : []).slice(0, 20),
          }))
          .filter((g: { name: string | null }) => g.name);
        if (parsed.length === 0) {
          return NextResponse.json({ error: "At least one grade is required" }, { status: 400 });
        }

        const { data: insertedGrades, error } = await supabase
          .from("grades")
          .insert(
            parsed.map((g: { name: string; level: number | null }) => ({
              school_id: schoolId,
              name: g.name,
              level: g.level,
            }))
          )
          .select("id, name");
        if (error) throw new Error(error.message);

        const classRows: Record<string, unknown>[] = [];
        for (let i = 0; i < parsed.length; i++) {
          const grade = insertedGrades.find((g) => g.name === parsed[i].name) ?? insertedGrades[i];
          for (const c of parsed[i].classes) {
            const name = asString(c?.name);
            if (!name) continue;
            classRows.push({
              school_id: schoolId,
              grade_id: grade.id,
              name,
              stream: asString(c?.stream),
              capacity: typeof c?.capacity === "number" ? c.capacity : 40,
            });
          }
        }
        if (classRows.length > 0) {
          const { error: classError } = await supabase.from("classes").insert(classRows);
          if (classError) throw new Error(classError.message);
        }
        result = { grades: insertedGrades.length, classes: classRows.length };
        break;
      }

      case "subjects": {
        const mode = body.mode === "manual" ? "manual" : "cbc";
        let rows: { school_id: string; name: string; code: string | null }[] = [];

        if (mode === "cbc") {
          const { data: school } = await supabase
            .from("schools")
            .select("education_level")
            .eq("id", schoolId)
            .single();
          const level = school?.education_level;
          const list =
            level === "junior"
              ? JUNIOR_SCHOOL_SUBJECTS
              : level === "senior"
                ? SENIOR_SCHOOL_SUBJECTS
                : [...JUNIOR_SCHOOL_SUBJECTS, ...SENIOR_SCHOOL_SUBJECTS];
          rows = list.map((s) => ({ school_id: schoolId, name: s.name, code: s.code }));
        } else {
          const subjects = Array.isArray(body.subjects) ? body.subjects.slice(0, 60) : [];
          rows = subjects
            .map((s: Record<string, unknown>) => ({
              school_id: schoolId,
              name: asString(s?.name),
              code: asString(s?.code),
            }))
            .filter((s: { name: string | null }) => s.name) as typeof rows;
        }

        if (rows.length === 0) {
          return NextResponse.json({ error: "No subjects provided" }, { status: 400 });
        }
        const { error } = await supabase.from("subjects").insert(rows);
        if (error) throw new Error(error.message);
        await supabase.from("schools").update({ curriculum_subjects_loaded: true }).eq("id", schoolId);
        result = { subjects: rows.length };
        break;
      }

      case "periods": {
        const periods = Array.isArray(body.periods) ? body.periods.slice(0, 15) : [];
        const rows = periods
          .map((p: Record<string, unknown>, i: number) => ({
            school_id: schoolId,
            name: asString(p?.name) ?? `Period ${i + 1}`,
            start_time: asString(p?.startTime),
            end_time: asString(p?.endTime),
            position: i + 1,
          }))
          .filter((p: { start_time: string | null; end_time: string | null }) => p.start_time && p.end_time);
        if (rows.length === 0) {
          return NextResponse.json({ error: "At least one period is required" }, { status: 400 });
        }
        const { error } = await supabase.from("periods").insert(rows);
        if (error) throw new Error(error.message);
        result = { periods: rows.length };
        break;
      }

      case "fees": {
        const structures = Array.isArray(body.structures) ? body.structures.slice(0, 30) : [];
        const rows = structures
          .map((f: Record<string, unknown>) => ({
            school_id: schoolId,
            name: asString(f?.name),
            amount: typeof f?.amount === "number" && f.amount > 0 ? f.amount : null,
          }))
          .filter((f: { name: string | null; amount: number | null }) => f.name && f.amount);
        if (rows.length === 0) {
          return NextResponse.json({ error: "No valid fee structures provided" }, { status: 400 });
        }
        const { error } = await supabase.from("fee_structures").insert(rows);
        if (error) throw new Error(error.message);
        result = { feeStructures: rows.length };
        break;
      }

      case "complete": {
        const { data: school } = await supabase
          .from("schools")
          .select("status")
          .eq("id", schoolId)
          .single();
        if (school?.status === "approved") {
          await supabase.from("schools").update({ status: "active" }).eq("id", schoolId);
        }
        result = { done: true };
        break;
      }
    }

    // Track progress (informative; the dashboard prompt checks actual data).
    const current = STEP_PROGRESS[step];
    const { error: rpcError } = await supabase.rpc("set_onboarding_progress", {
      p_school_id: schoolId,
      p_progress: current,
    });
    if (rpcError) {
      // RPC not deployed — fall back to a direct update.
      await supabase.from("schools").update({ onboarding_progress: current }).eq("id", schoolId);
    }

    return NextResponse.json({ ok: true, step, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onboarding step failed" },
      { status: 500 }
    );
  }
}
