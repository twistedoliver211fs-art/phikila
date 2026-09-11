import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { ValidationError, ForbiddenError, NotFoundError } from "@/lib/errors";

interface ScoreEntry {
  studentId: string;
  subjectId: string;
  score: number;
}

export const POST = createRoute(async ({ request, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { examId, classId, scores } = body as {
    examId: string;
    classId: string;
    scores: ScoreEntry[];
  };

  if (!examId || !classId || !Array.isArray(scores) || scores.length === 0) {
    throw new ValidationError("examId, classId, and scores array are required");
  }

  const admin = createAdminClient();

  const { data: exam, error: examErr } = await admin
    .from("exams")
    .select("id, school_id, total_marks")
    .eq("id", examId)
    .single();

  if (examErr || !exam) throw new NotFoundError("Exam");
  if (exam.school_id !== schoolId) throw new ForbiddenError("Exam does not belong to your school");

  const { data: cls, error: clsErr } = await admin
    .from("classes")
    .select("id, school_id")
    .eq("id", classId)
    .single();

  if (clsErr || !cls) throw new NotFoundError("Class");
  if (cls.school_id !== schoolId) throw new ForbiddenError("Class does not belong to your school");

  const { data: gradingRows } = await admin
    .from("grading_systems")
    .select("grade_label, min_score, max_score")
    .eq("school_id", schoolId)
    .order("min_score", { ascending: false });

  const grading = gradingRows ?? [];
  const totalMarks = exam.total_marks || 100;

  const getGrade = (pct: number): string => {
    for (const g of grading) {
      if (pct >= g.min_score && pct <= g.max_score) return g.grade_label;
    }
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    if (pct >= 40) return "E";
    return "F";
  };

  const records = scores.map((s) => {
    const score = Number(s.score);
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    return {
      exam_id: examId,
      student_id: s.studentId,
      subject_id: s.subjectId,
      score,
      percentage: Math.round(percentage * 100) / 100,
      grade: getGrade(percentage),
      recorded_by: user.id,
    };
  });

  const { data, error } = await admin
    .from("exam_results")
    .upsert(records, { onConflict: "exam_id,student_id,subject_id" })
    .select();

  if (error) {
    throw new ValidationError(`Failed to save scores: ${error.message}`);
  }

  return NextResponse.json({ results: data, count: records.length }, { status: 201 });
});
