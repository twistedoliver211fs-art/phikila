"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Exam {
  id: string;
  name: string;
  total_marks: number;
  exam_type: string;
  exam_date: string;
}

interface ClassRow {
  id: string;
  name: string;
  grades: { name: string } | null;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
}

interface Subject {
  id: string;
  name: string;
}

interface GradingGrade {
  grade_label: string;
  min_score: number;
  max_score: number;
}

export default function BatchScoreEntryPage() {
  const params = useParams();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradingSystem, setGradingSystem] = useState<GradingGrade[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [scores, setScores] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single()
        .then(async ({ data: sm }) => {
          if (!sm) return;
          const sid = sm.school_id;

          const [examRes, classesRes, subjectsRes, gradingRes] =
            await Promise.all([
              supabase
                .from("exams")
                .select("id, name, total_marks, exam_type, exam_date")
                .eq("id", examId)
                .single(),
              supabase
                .from("classes")
                .select("id, name, grades(name)")
                .eq("school_id", sid),
              supabase
                .from("subjects")
                .select("id, name")
                .eq("school_id", sid)
                .order("name"),
              supabase
                .from("grading_systems")
                .select("grade_label, min_score, max_score")
                .eq("school_id", sid)
                .order("min_score", { ascending: false }),
            ]);

          setExam(examRes.data);
          setClasses((classesRes.data ?? []) as unknown as ClassRow[]);
          setSubjects(subjectsRes.data ?? []);
          setGradingSystem(gradingRes.data ?? []);
          setLoading(false);
        });
    });
  }, [examId]);

  useEffect(() => {
    if (!selectedClassId) return;

    let cancelled = false;
    const supabase = createClient();

    Promise.all([
      supabase
        .from("students")
        .select("id, first_name, last_name, admission_number")
        .eq("class_id", selectedClassId)
        .eq("is_active", true)
        .order("last_name"),
      supabase
        .from("exam_results")
        .select("student_id, subject_id, score, percentage, grade")
        .eq("exam_id", examId),
    ]).then(([studentsRes, resultsRes]) => {
      if (cancelled) return;

      const studentList = studentsRes.data ?? [];
      setStudents(studentList);

      const classStudentIds = new Set(studentList.map((s) => s.id));
      const existing = (resultsRes.data ?? []).filter((r) =>
        classStudentIds.has(r.student_id)
      );

      const scoreMap: Record<string, Record<string, string>> = {};
      studentList.forEach((s) => {
        scoreMap[s.id] = {};
      });
      existing.forEach((r) => {
        if (scoreMap[r.student_id]) {
          scoreMap[r.student_id][r.subject_id] = String(r.score);
        }
      });
      setScores(scoreMap);
      setLoadingStudents(false);
    });

    return () => { cancelled = true; };
  }, [selectedClassId, examId]);

  const getGrade = (pct: number): string => {
    for (const g of gradingSystem) {
      if (pct >= g.min_score && pct <= g.max_score) return g.grade_label;
    }
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    if (pct >= 40) return "E";
    return "F";
  };

  const totalMarks = exam?.total_marks || 100;

  const updateScore = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: value },
    }));
  };

  const filledCount = useMemo(() => {
    let count = 0;
    for (const studentId of Object.keys(scores)) {
      for (const subjectId of Object.keys(scores[studentId] ?? {})) {
        if (scores[studentId][subjectId] !== "") count++;
      }
    }
    return count;
  }, [scores]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const payload: { studentId: string; subjectId: string; score: number }[] =
      [];
    for (const studentId of Object.keys(scores)) {
      for (const subjectId of Object.keys(scores[studentId] ?? {})) {
        const val = scores[studentId][subjectId];
        if (val !== "") {
          payload.push({
            studentId,
            subjectId,
            score: Number(val),
          });
        }
      }
    }

    if (payload.length === 0) {
      setMessage({ type: "error", text: "No scores to save." });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/exam-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          classId: selectedClassId,
          scores: payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Failed to save scores.",
        });
      } else {
        setMessage({
          type: "success",
          text: `Saved ${data.count} score${data.count !== 1 ? "s" : ""} successfully.`,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-sm">Loading exam...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Exam not found.</p>
        <Link href="/principal/exams">
          <Button variant="outline" size="sm">
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
          <div className="flex items-center gap-2 mb-1">
            <Link href="/principal/exams">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Enter Scores
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {exam.name} &mdash; /{totalMarks} marks &mdash;{" "}
            <Badge variant="secondary" className="capitalize ml-1">
              {exam.exam_type}
            </Badge>
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label
              htmlFor="class-select"
              className="text-sm font-medium text-foreground"
            >
              Select Class:
            </label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[200px]"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.grades ? `${cls.grades.name} ` : ""}
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedClassId && (
        <>
          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading students...
              </span>
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No students found in this class.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-3 text-left font-medium text-muted-foreground min-w-[180px] sticky left-0 bg-card z-10">
                          Student
                        </th>
                        {subjects.map((sub) => (
                          <th
                            key={sub.id}
                            className="p-3 text-center font-medium text-muted-foreground min-w-[100px]"
                          >
                            {sub.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="p-3 sticky left-0 bg-card z-10">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                <span className="text-[10px] font-bold text-primary">
                                  {student.first_name[0]}
                                  {student.last_name[0]}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {student.first_name} {student.last_name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {student.admission_number}
                                </p>
                              </div>
                            </div>
                          </td>
                          {subjects.map((sub) => {
                            const val =
                              scores[student.id]?.[sub.id] ?? "";
                            const numVal = val !== "" ? Number(val) : null;
                            const pct =
                              numVal !== null
                                ? (numVal / totalMarks) * 100
                                : null;
                            const grade =
                              pct !== null ? getGrade(pct) : null;

                            return (
                              <td key={sub.id} className="p-2">
                                <div className="flex flex-col items-center gap-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={totalMarks}
                                    value={val}
                                    onChange={(e) =>
                                      updateScore(
                                        student.id,
                                        sub.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="—"
                                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                  />
                                  {grade && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {pct?.toFixed(0)}% &middot;{" "}
                                      <span
                                        className={
                                          grade === "A"
                                            ? "text-emerald-600 font-semibold"
                                            : grade === "F"
                                              ? "text-red-600 font-semibold"
                                              : ""
                                        }
                                      >
                                        {grade}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  {filledCount} score{filledCount !== 1 ? "s" : ""} entered
                  &middot; {students.length} student{students.length !== 1 ? "s" : ""}
                </p>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save All Scores"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
