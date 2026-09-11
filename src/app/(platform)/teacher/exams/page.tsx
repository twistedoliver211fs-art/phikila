"use client";

import { useEffect, useState } from "react";
import {
  Save,
  CheckCircle,
  AlertCircle,
  PenLine,
  ArrowLeft,
  Loader2,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  total_marks: number;
  exam_type: string;
  created_at: string;
}

interface ClassOption {
  id: string;
  grade_name: string;
  class_name: string;
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
  score: string;
}

interface GradingGrade {
  grade_label: string;
  min_score: number;
  max_score: number;
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [gradingSystem, setGradingSystem] = useState<GradingGrade[]>([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [view, setView] = useState<"list" | "entry">("list");
  const [existingResults, setExistingResults] = useState<{ studentId: string; subjectId: string; score: number }[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data: sm } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!sm) {
        setLoading(false);
        return;
      }
      setSchoolId(sm.school_id);

      const { data: staff } = await supabase
        .from("staff")
        .select("id")
        .eq("school_id", sm.school_id)
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!staff) {
        setLoading(false);
        return;
      }

      const [examsRes, assignmentsRes, gradingRes] = await Promise.all([
        supabase
          .from("exams")
          .select("id, name, exam_date, total_marks, exam_type, created_at")
          .eq("school_id", sm.school_id)
          .order("exam_date", { ascending: false }),
        supabase
          .from("teacher_subject_assignments")
          .select(
            "class_id, subject_id, classes(id, name, grades(name)), subjects(id, name)"
          )
          .eq("staff_id", staff.id),
        supabase
          .from("grading_systems")
          .select("grade_label, min_score, max_score")
          .eq("school_id", sm.school_id)
          .order("min_score", { ascending: false }),
      ]);

      setExams(examsRes.data ?? []);
      setGradingSystem(gradingRes.data ?? []);

      const classMap = new Map<
        string,
        { grade_name: string; class_name: string }
      >();
      const subjectMap = new Map<string, string>();

      (assignmentsRes.data ?? []).forEach((a: Record<string, unknown>) => {
        const cls = a.classes as Record<string, unknown> | null;
        if (cls) {
          const grades = cls.grades as Record<string, unknown> | null;
          classMap.set(cls.id as string, {
            grade_name: (grades?.name as string) ?? "",
            class_name: cls.name as string,
          });
        }
        const subj = a.subjects as Record<string, unknown> | null;
        if (subj) {
          subjectMap.set(subj.id as string, subj.name as string);
        }
      });

      setClasses(
        Array.from(classMap.entries()).map(([id, c]) => ({
          id,
          grade_name: c.grade_name,
          class_name: c.class_name,
        }))
      );

      setSubjects(
        Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }))
      );

      setLoading(false);
    }

    init();
  }, []);

  useEffect(() => {
    if (!selectedClass || !schoolId) return;

    const supabase = createClient();
    supabase
      .from("students")
      .select("id, first_name, last_name, admission_number")
      .eq("class_id", selectedClass)
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .order("last_name")
      .then(({ data }) => {
        setStudents(
          (data ?? []).map((s) => ({
            ...s,
            score: "",
          }))
        );
      });
  }, [selectedClass, schoolId]);

  useEffect(() => {
    if (!selectedExam || !selectedClass || !selectedSubject) return;
    const supabase = createClient();
    supabase
      .from("exam_results")
      .select("exam_id, student_id, subject_id, score")
      .eq("exam_id", selectedExam)
      .eq("subject_id", selectedSubject)
      .then(({ data }) => {
        const relevant = data ?? [];
        setStudents((prev) => {
          const classStudentIds = new Set(prev.map((s) => s.id));
          const filtered = relevant.filter((r) =>
            classStudentIds.has(r.student_id)
          );
          return prev.map((s) => {
            const existing = filtered.find((r) => r.student_id === s.id);
            return {
              ...s,
              score: existing ? String(existing.score) : "",
            };
          });
        });
      });
  }, [selectedExam, selectedClass, selectedSubject]);

  const updateScore = (studentId: string, score: string) => {
    if (score !== "" && !/^\d*\.?\d*$/.test(score)) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, score } : s))
    );
  };

  const getGrade = (percentage: number): string => {
    for (const g of gradingSystem) {
      if (percentage >= g.min_score && percentage <= g.max_score) {
        return g.grade_label;
      }
    }
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 40) return "E";
    return "F";
  };

  const getSelectedExamTotal = (): number => {
    const exam = exams.find((e) => e.id === selectedExam);
    return exam?.total_marks ?? 100;
  };

  const studentsWithScores = students.filter(
    (s) => s.score !== "" && !isNaN(Number(s.score))
  );
  const totalScore = studentsWithScores.reduce(
    (sum, s) => sum + Number(s.score),
    0
  );
  const avgPercentage =
    studentsWithScores.length > 0
      ? (totalScore / studentsWithScores.length / getSelectedExamTotal()) * 100
      : 0;

  const handleStartEntry = (examId: string) => {
    setSelectedExam(examId);
    setSelectedClass("");
    setSelectedSubject("");
    setStudents([]);
    setExistingResults([]);
    setMessage(null);
    setView("entry");
  };

  const handleBack = () => {
    setView("list");
    setSelectedExam("");
    setSelectedClass("");
    setSelectedSubject("");
    setStudents([]);
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (!selectedExam || !selectedSubject || studentsWithScores.length === 0)
      return;

    setSubmitting(true);
    setMessage(null);

    const totalMarks = getSelectedExamTotal();

    const records = studentsWithScores.map((s) => {
      const score = Number(s.score);
      const percentage = (score / totalMarks) * 100;
      const grade = getGrade(percentage);

      return {
        exam_id: selectedExam,
        student_id: s.id,
        subject_id: selectedSubject,
        score,
        grade,
        percentage: Math.round(percentage * 100) / 100,
        recorded_by: userId,
      };
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("exam_results")
      .upsert(records, { onConflict: "exam_id,student_id,subject_id" });

    if (error) {
      setMessage({
        type: "error",
        text: `Failed to submit: ${error.message}`,
      });
    } else {
      setMessage({
        type: "success",
        text: `Successfully submitted ${records.length} result${records.length !== 1 ? "s" : ""}.`,
      });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading exams...</span>
      </div>
    );
  }

  if (view === "entry") {
    const currentExam = exams.find((e) => e.id === selectedExam);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {currentExam?.name ?? "Enter Scores"}
            </h1>
            <p className="text-muted-foreground mt-1">
              /{getSelectedExamTotal()} marks
              {currentExam && (
                <Badge
                  variant="secondary"
                  className="capitalize ml-2"
                >
                  {currentExam.exam_type}
                </Badge>
              )}
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

        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade_name} {c.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedClass && selectedSubject && (
          <>
            {students.length === 0 ? (
              <div className="rounded-xl border border-border bg-card py-12 text-center">
                <p className="text-muted-foreground">
                  No students found in this class.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-3 text-left font-medium text-muted-foreground">
                          Student
                        </th>
                        <th className="p-3 text-left font-medium text-muted-foreground">
                          Admission
                        </th>
                        <th className="p-3 text-left font-medium text-muted-foreground">
                          Score
                        </th>
                        <th className="p-3 text-right font-medium text-muted-foreground">
                          /{getSelectedExamTotal()}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const numVal =
                          student.score !== ""
                            ? Number(student.score)
                            : null;
                        const pct =
                          numVal !== null
                            ? (numVal / getSelectedExamTotal()) * 100
                            : null;
                        const grade = pct !== null ? getGrade(pct) : null;

                        return (
                          <tr
                            key={student.id}
                            className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                  <span className="text-xs font-bold text-primary">
                                    {student.first_name[0]}
                                    {student.last_name[0]}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  {student.first_name} {student.last_name}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {student.admission_number}
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                max={getSelectedExamTotal()}
                                value={student.score}
                                onChange={(e) =>
                                  updateScore(student.id, e.target.value)
                                }
                                placeholder="—"
                                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </td>
                            <td className="p-3 text-right">
                              {grade && (
                                <span className="text-xs text-muted-foreground">
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {studentsWithScores.length > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  {studentsWithScores.length} student
                  {studentsWithScores.length !== 1 ? "s" : ""} scored &middot;
                  Average{" "}
                  <span className="font-semibold text-foreground">
                    {avgPercentage.toFixed(1)}%
                  </span>
                </p>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {submitting ? "Submitting..." : "Submit Results"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exams</h1>
        <p className="text-muted-foreground mt-1">
          Select an exam to enter scores for your assigned classes
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No exams available for your school.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const examDate = exam.exam_date
              ? new Date(exam.exam_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <Card
                key={exam.id}
                className="hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {exam.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="capitalize text-xs"
                        >
                          {exam.exam_type}
                        </Badge>
                        {examDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {examDate}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          /{exam.total_marks} marks
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartEntry(exam.id)}
                    className="shrink-0"
                  >
                    <PenLine className="mr-2 h-4 w-4" />
                    Enter Scores
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
