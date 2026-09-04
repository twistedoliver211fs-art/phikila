"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Save,
  Wand2,
  FileSpreadsheet,
  Loader2,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  total_marks: number;
  exam_type: string;
  school_id: string;
}

interface ClassRow {
  id: string;
  name: string;
  grades?: { name: string } | null;
}

interface Subject {
  id: string;
  name: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
}

interface GradingGrade {
  grade_label: string;
  min_score: number;
  max_score: number;
}

interface ResultRow {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  score: string;
  grade: string;
  percentage: string;
  remarks: string;
  subject_id?: string;
  existing_result_id?: string;
}

function getGrade(
  score: number,
  total: number,
  gradingSystem: GradingGrade[]
): string {
  const percentage = (score / total) * 100;
  for (const g of gradingSystem) {
    if (percentage >= g.min_score && percentage <= g.max_score) {
      return g.grade_label;
    }
  }
  return gradingSystem[gradingSystem.length - 1]?.grade_label ?? "E";
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "B":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "C":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "D":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "E":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [gradingSystem, setGradingSystem] = useState<GradingGrade[]>([]);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const [mode, setMode] = useState<"class" | "student">("class");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single()
        .then(async ({ data: sm }) => {
          if (!sm) {
            setLoading(false);
            return;
          }
          setSchoolId(sm.school_id);

          const [examRes, classRes, subjectRes, studentRes, gradeRes] =
            await Promise.all([
              supabase
                .from("exams")
                .select("*")
                .eq("id", examId)
                .single(),
              supabase
                .from("classes")
                .select("id, name, grades(name)")
                .eq("school_id", sm.school_id)
                .order("name"),
              supabase
                .from("subjects")
                .select("id, name")
                .eq("school_id", sm.school_id)
                .order("name"),
              supabase
                .from("students")
                .select("id, first_name, last_name, admission_number, class_id")
                .eq("school_id", sm.school_id)
                .eq("is_active", true)
                .order("last_name"),
              supabase
                .from("grading_systems")
                .select("grade_label, min_score, max_score")
                .eq("school_id", sm.school_id)
                .order("min_score", { ascending: false }),
            ]);

          if (examRes.data) setExam(examRes.data as Exam);
          setClasses((classRes.data as unknown as ClassRow[]) ?? []);
          setSubjects((subjectRes.data as Subject[]) ?? []);
          setAllStudents((studentRes.data as Student[]) ?? []);
          setGradingSystem((gradeRes.data as GradingGrade[]) ?? []);
          setLoading(false);
        });
    });
  }, [examId]);

  const filteredStudents = useMemo(() => {
    if (mode === "class" && selectedClass) {
      return allStudents.filter((s) => s.class_id === selectedClass);
    }
    if (mode === "student" && selectedStudent) {
      return allStudents.filter((s) => s.id === selectedStudent);
    }
    return [];
  }, [mode, selectedClass, selectedStudent, allStudents]);

  useEffect(() => {
    if (filteredStudents.length === 0) {
      setRows([]);
      return;
    }

    const supabase = createClient();
    const fetchExisting = async () => {
      const studentIds = filteredStudents.map((s) => s.id);
      let query = supabase
        .from("exam_results")
        .select("id, student_id, subject_id, score, grade, percentage, remarks")
        .eq("exam_id", examId)
        .in("student_id", studentIds);

      if (mode === "class" && selectedSubject) {
        query = query.eq("subject_id", selectedSubject);
      }

      const { data: existing } = await query;
      const existingMap = new Map<string, Record<string, unknown>>();
      (existing ?? []).forEach((r) => {
        const key =
          mode === "class"
            ? `${r.student_id}`
            : `${r.student_id}-${r.subject_id}`;
        existingMap.set(key, r);
      });

      const newRows: ResultRow[] = [];
      for (const s of filteredStudents) {
        if (mode === "class") {
          const ex = existingMap.get(s.id);
          newRows.push({
            student_id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            admission_number: s.admission_number,
            score: String(ex?.score ?? ""),
            grade: String(ex?.grade ?? ""),
            percentage: String(ex?.percentage ?? ""),
            remarks: String(ex?.remarks ?? ""),
            subject_id: selectedSubject,
            existing_result_id: ex?.id as string | undefined,
          });
        } else {
          for (const sub of subjects) {
            const ex = existingMap.get(`${s.id}-${sub.id}`);
            newRows.push({
              student_id: s.id,
              first_name: s.first_name,
              last_name: s.last_name,
              admission_number: s.admission_number,
              score: String(ex?.score ?? ""),
              grade: String(ex?.grade ?? ""),
              percentage: String(ex?.percentage ?? ""),
              remarks: String(ex?.remarks ?? ""),
              subject_id: sub.id,
              existing_result_id: ex?.id as string | undefined,
            });
          }
        }
      }

      setRows(newRows);
    };

    fetchExisting();
  }, [filteredStudents, examId, mode, selectedSubject, subjects]);

  const updateRow = (index: number, field: keyof ResultRow, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, [field]: value };
        if (field === "score" && exam) {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            updated.percentage = ((num / exam.total_marks) * 100).toFixed(1);
            updated.grade = getGrade(num, exam.total_marks, gradingSystem);
          } else {
            updated.percentage = "";
            updated.grade = "";
          }
        }
        return updated;
      })
    );
  };

  const autoGradeAll = () => {
    if (!exam) return;
    setRows((prev) =>
      prev.map((r) => {
        const num = parseFloat(r.score);
        if (isNaN(num)) return r;
        const pct = (num / exam.total_marks) * 100;
        return {
          ...r,
          percentage: pct.toFixed(1),
          grade: getGrade(num, exam.total_marks, gradingSystem),
        };
      })
    );
  };

  const saveResults = async () => {
    if (!exam || !schoolId) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const toSave = rows
      .filter((r) => r.score !== "" && !isNaN(parseFloat(r.score)))
      .map((r) => {
        const score = parseFloat(r.score);
        const percentage = (score / exam.total_marks) * 100;
        const grade = r.grade || getGrade(score, exam.total_marks, gradingSystem);
        return {
          id: r.existing_result_id || undefined,
          exam_id: examId,
          student_id: r.student_id,
          subject_id: r.subject_id ?? selectedSubject,
          score,
          grade,
          percentage,
          remarks: r.remarks || null,
          recorded_by: user?.id ?? null,
        };
      });

    if (toSave.length === 0) {
      setError("No scores to save.");
      setSaving(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from("exam_results")
      .upsert(toSave, { onConflict: "exam_id,student_id,subject_id" });

    if (upsertError) {
      setError("Failed to save results. Please try again.");
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const headers =
      mode === "class"
        ? ["Student", "Admission No.", "Score", "Grade", "%", "Remarks"]
        : ["Student", "Admission No.", "Subject", "Score", "Grade", "%", "Remarks"];

    const data = [headers];
    for (const r of rows) {
      if (mode === "class") {
        data.push([
          `${r.first_name} ${r.last_name}`,
          r.admission_number,
          r.score,
          r.grade,
          r.percentage ? `${r.percentage}%` : "",
          r.remarks,
        ]);
      } else {
        const subName = subjects.find((s) => s.id === r.subject_id)?.name ?? "";
        data.push([
          `${r.first_name} ${r.last_name}`,
          r.admission_number,
          subName,
          r.score,
          r.grade,
          r.percentage ? `${r.percentage}%` : "",
          r.remarks,
        ]);
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `${exam?.name ?? "exam"}-results.xlsx`);
  };

  const summary = useMemo(() => {
    const scored = rows.filter((r) => r.score !== "" && !isNaN(parseFloat(r.score)));
    if (scored.length === 0)
      return { avg: 0, highest: 0, lowest: 0, passRate: 0, count: 0 };

    const percentages = scored.map((r) => parseFloat(r.percentage));
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    const passCount = percentages.filter((p) => p >= 50).length;
    const passRate = (passCount / percentages.length) * 100;

    return {
      avg: avg.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      passRate: passRate.toFixed(0),
      count: scored.length,
    };
  }, [rows]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results Entry</h1>
          <p className="text-muted-foreground mt-1">Loading exam data...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results Entry</h1>
          <p className="text-muted-foreground mt-1">Exam not found.</p>
        </div>
        <Link href="/principal/exams">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/principal/exams"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Exams
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{exam.name}</h1>
          <p className="text-muted-foreground mt-1">
            {exam.exam_date
              ? new Date(exam.exam_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
            {" — "}
            Total: {exam.total_marks} marks
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
          Results saved successfully.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Mode
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as "class" | "student");
                setSelectedClass("");
                setSelectedSubject("");
                setSelectedStudent("");
                setRows([]);
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="class">By Class</option>
              <option value="student">By Student</option>
            </select>
          </div>

          {mode === "class" ? (
            <>
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setRows([]);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="">Select class...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.grades?.name ? `${c.grades.name} — ` : ""}
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setRows([]);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  setRows([]);
                }}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Select student...</option>
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.last_name}, {s.first_name} ({s.admission_number})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 text-left font-medium text-muted-foreground min-w-[160px]">
                      Student
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground min-w-[110px]">
                      Admission
                    </th>
                    {mode === "student" && (
                      <th className="p-4 text-left font-medium text-muted-foreground min-w-[140px]">
                        Subject
                      </th>
                    )}
                    <th className="p-4 text-left font-medium text-muted-foreground w-24">
                      Score
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground w-20">
                      Grade
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground w-20">
                      %
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground min-w-[140px]">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={`${row.student_id}-${row.subject_id ?? idx}`}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3 font-medium text-foreground">
                        {row.first_name} {row.last_name}
                      </td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">
                        {row.admission_number}
                      </td>
                      {mode === "student" && (
                        <td className="p-3 text-muted-foreground">
                          {subjects.find((s) => s.id === row.subject_id)?.name ??
                            "—"}
                        </td>
                      )}
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={exam.total_marks}
                          value={row.score}
                          onChange={(e) =>
                            updateRow(idx, "score", e.target.value)
                          }
                          placeholder="0"
                          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                      </td>
                      <td className="p-3">
                        {row.grade ? (
                          <span
                            className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold ${gradeColor(row.grade)}`}
                          >
                            {row.grade}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {row.percentage ? `${row.percentage}%` : "—"}
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) =>
                            updateRow(idx, "remarks", e.target.value)
                          }
                          placeholder="Optional"
                          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Class Summary
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {summary.avg}%
                </p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {summary.highest}%
                </p>
                <p className="text-xs text-muted-foreground">Highest</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {summary.lowest}%
                </p>
                <p className="text-xs text-muted-foreground">Lowest</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.passRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Pass Rate ({summary.count} scored)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={autoGradeAll}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Auto-Grade All
            </Button>
            <Button
              size="sm"
              onClick={saveResults}
              disabled={saving}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Results"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </>
      )}

      {rows.length === 0 && (selectedClass || selectedStudent) && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {mode === "class" && !selectedSubject
              ? "Select a subject to start entering results."
              : "No students found for the selected filters."}
          </p>
        </div>
      )}
    </div>
  );
}
