import { createAdminClient } from "@/lib/supabase/server-admin";
import { NotFoundError } from "@/lib/errors";

export interface ReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  examId: string;
  classId: string;
  academicYearId: string;
  termId: string;
  totalScore: number;
  averageScore: number;
  classRank: number | null;
  classSize: number | null;
  overallGrade: string | null;
  remarks: string | null;
  generatedAt: string;
  generatedBy: string | null;
}

export interface ReportCardDetail extends ReportCard {
  studentName: string;
  admissionNumber: string;
  className: string;
  examName: string;
  termName: string;
  academicYearName: string;
  subjects: Array<{
    subjectName: string;
    score: number;
    grade: string | null;
    rank: number | null;
  }>;
}

function mapReportCard(row: Record<string, unknown>): ReportCard {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    studentId: row.student_id as string,
    examId: row.exam_id as string,
    classId: row.class_id as string,
    academicYearId: row.academic_year_id as string,
    termId: row.term_id as string,
    totalScore: Number(row.total_score),
    averageScore: Number(row.average_score),
    classRank: row.class_rank as number | null,
    classSize: row.class_size as number | null,
    overallGrade: row.overall_grade as string | null,
    remarks: row.remarks as string | null,
    generatedAt: row.generated_at as string,
    generatedBy: row.generated_by as string | null,
  };
}

export async function getReportCards(
  schoolId: string,
  examId?: string
): Promise<ReportCard[]> {
  const admin = createAdminClient();
  let query = admin
    .from("report_cards")
    .select("*")
    .eq("school_id", schoolId)
    .order("generated_at", { ascending: false });

  if (examId) query = query.eq("exam_id", examId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapReportCard);
}

export async function getReportCardById(
  reportCardId: string
): Promise<ReportCardDetail> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("report_cards")
    .select(`
      *,
      students!inner(first_name, last_name, admission_number),
      classes!inner(name),
      exams!inner(name),
      terms!inner(name),
      academic_years!inner(name)
    `)
    .eq("id", reportCardId)
    .single();

  if (error || !data) throw new NotFoundError("Report card not found");

  const base = mapReportCard(data);
  const students = data.students as unknown as Record<string, unknown>;
  const classes = data.classes as unknown as Record<string, unknown>;
  const exams = data.exams as unknown as Record<string, unknown>;
  const terms = data.terms as unknown as Record<string, unknown>;
  const years = data.academic_years as unknown as Record<string, unknown>;

  const { data: results } = await admin
    .from("exam_results")
    .select("score, subjects!inner(name)")
    .eq("exam_id", base.examId)
    .eq("student_id", base.studentId);

  return {
    ...base,
    studentName: `${students.first_name} ${students.last_name}`,
    admissionNumber: students.admission_number as string,
    className: classes.name as string,
    examName: exams.name as string,
    termName: terms.name as string,
    academicYearName: years.name as string,
    subjects: (results ?? []).map((r) => {
      const subjects = r.subjects as unknown as Record<string, unknown>;
      return {
        subjectName: subjects.name as string,
        score: Number(r.score),
        grade: null,
        rank: null,
      };
    }),
  };
}

export async function getReportCardsByStudent(
  studentId: string
): Promise<ReportCard[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("report_cards")
    .select("*")
    .eq("student_id", studentId)
    .order("generated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapReportCard);
}

export async function generateReportCard(params: {
  schoolId: string;
  studentId: string;
  examId: string;
  classId: string;
  academicYearId: string;
  termId: string;
  generatedBy?: string;
}): Promise<ReportCard> {
  const admin = createAdminClient();

  const existing = await admin
    .from("report_cards")
    .select("id")
    .eq("student_id", params.studentId)
    .eq("exam_id", params.examId)
    .single();

  if (existing.data) {
    return mapReportCard(existing.data);
  }

  const { data: results } = await admin
    .from("exam_results")
    .select("score")
    .eq("exam_id", params.examId)
    .eq("student_id", params.studentId);

  const scores = (results ?? []).map((r) => Number(r.score));
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const averageScore = scores.length > 0 ? totalScore / scores.length : 0;

  const { count: classSize } = await admin
    .from("exam_results")
    .select("student_id", { count: "exact", head: true })
    .eq("exam_id", params.examId);

  const { data: allAverages } = await admin
    .from("exam_results")
    .select("student_id")
    .eq("exam_id", params.examId);

  const studentAverages = new Map<string, number>();
  for (const row of allAverages ?? []) {
    const sid = row.student_id as string;
    if (!studentAverages.has(sid)) {
      const { data: studentResults } = await admin
        .from("exam_results")
        .select("score")
        .eq("exam_id", params.examId)
        .eq("student_id", sid);
      const sScores = (studentResults ?? []).map((r) => Number(r.score));
      studentAverages.set(sid, sScores.length > 0 ? sScores.reduce((a, b) => a + b, 0) / sScores.length : 0);
    }
  }

  let rank = 1;
  for (const [, avg] of studentAverages) {
    if (avg > averageScore) rank++;
  }

  const overallGrade = averageScore >= 80 ? "A" :
    averageScore >= 70 ? "B" :
    averageScore >= 60 ? "C" :
    averageScore >= 50 ? "D" :
    averageScore >= 40 ? "E" : "F";

  const { data, error } = await admin
    .from("report_cards")
    .insert({
      school_id: params.schoolId,
      student_id: params.studentId,
      exam_id: params.examId,
      class_id: params.classId,
      academic_year_id: params.academicYearId,
      term_id: params.termId,
      total_score: totalScore,
      average_score: averageScore,
      class_rank: rank,
      class_size: classSize ?? 0,
      overall_grade: overallGrade,
      generated_by: params.generatedBy ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapReportCard(data);
}
