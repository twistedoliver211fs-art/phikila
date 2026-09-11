import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { getReportCards, getReportCardById, generateReportCard } from "@/lib/services/reportcard";
import { ForbiddenError } from "@/lib/errors";

export const GET = createRoute(async ({ searchParams, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const reportCardId = searchParams.get("id");
  if (reportCardId) {
    const reportCard = await getReportCardById(reportCardId);
    if (reportCard.schoolId !== schoolId) {
      throw new ForbiddenError("Report card not found in your school");
    }
    return NextResponse.json({ reportCard });
  }

  const examId = searchParams.get("examId") ?? undefined;
  const reportCards = await getReportCards(schoolId, examId);
  return NextResponse.json({ reportCards });
});

export const POST = createRoute(async ({ request }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { studentId, examId, classId, academicYearId, termId } = body;

  if (!studentId || !examId || !classId || !academicYearId || !termId) {
    return NextResponse.json(
      { error: "studentId, examId, classId, academicYearId, and termId are required" },
      { status: 400 }
    );
  }

  const reportCard = await generateReportCard({
    schoolId,
    studentId,
    examId,
    classId,
    academicYearId,
    termId,
  });

  return NextResponse.json({ reportCard }, { status: 201 });
});
