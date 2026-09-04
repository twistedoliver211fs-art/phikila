"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  total_marks: number;
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
  const [staffId, setStaffId] = useState("");
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data: sm } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!sm) { setLoading(false); return; }
      setSchoolId(sm.school_id);

      const { data: staff } = await supabase
        .from("staff")
        .select("id")
        .eq("school_id", sm.school_id)
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!staff) { setLoading(false); return; }
      setStaffId(staff.id);

      const [examsRes, assignmentsRes, gradingRes] = await Promise.all([
        supabase
          .from("exams")
          .select("id, name, exam_date, total_marks")
          .eq("school_id", sm.school_id)
          .order("exam_date", { ascending: false }),
        supabase
          .from("teacher_subject_assignments")
          .select("class_id, subject_id, classes(id, name, grades(name)), subjects(id, name)")
          .eq("staff_id", staff.id),
        supabase
          .from("grading_systems")
          .select("grade_label, min_score, max_score")
          .eq("school_id", sm.school_id)
          .order("min_score", { ascending: false }),
      ]);

      setExams(examsRes.data ?? []);
      setGradingSystem(gradingRes.data ?? []);

      const classMap = new Map<string, { grade_name: string; class_name: string }>();
      const subjectMap = new Map<string, string>();

      (assignmentsRes.data ?? []).forEach((a: any) => {
        const cls = a.classes;
        if (cls) {
          classMap.set(cls.id, {
            grade_name: cls.grades?.name ?? "",
            class_name: cls.name,
          });
        }
        const subj = a.subjects;
        if (subj) {
          subjectMap.set(subj.id, subj.name);
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
    if (!selectedClass) { setStudents([]); return; }

    const supabase = createClient();

    async function fetchStudents() {
      const { data } = await supabase
        .from("students")
        .select("id, first_name, last_name, admission_number")
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId)
        .eq("is_active", true)
        .order("last_name");

      setStudents(
        (data ?? []).map((s) => ({
          ...s,
          score: "",
        }))
      );
    }

    fetchStudents();
  }, [selectedClass, schoolId]);

  const updateScore = (studentId: string, score: string) => {
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
    return "E";
  };

  const getSelectedExamTotal = (): number => {
    const exam = exams.find((e) => e.id === selectedExam);
    return exam?.total_marks ?? 100;
  };

  const studentsWithScores = students.filter((s) => s.score !== "" && !isNaN(Number(s.score)));
  const totalScore = studentsWithScores.reduce((sum, s) => sum + Number(s.score), 0);
  const avgPercentage = studentsWithScores.length > 0
    ? (totalScore / studentsWithScores.length / getSelectedExamTotal()) * 100
    : 0;

  const handleSubmit = async () => {
    if (!selectedExam || !selectedSubject || studentsWithScores.length === 0) return;

    setSubmitting(true);
    setMessage(null);

    const supabase = createClient();
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

    const { error } = await supabase
      .from("exam_results")
      .upsert(records, { onConflict: "exam_id,student_id,subject_id" });

    if (error) {
      setMessage({ type: "error", text: `Failed to submit: ${error.message}` });
    } else {
      setMessage({ type: "success", text: `Successfully submitted ${records.length} results.` });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading exam data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit Exam Results</h1>
        <p className="text-muted-foreground mt-1">Record scores for your classes</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} ({exam.total_marks} marks)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Class</label>
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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
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

      {selectedExam && selectedClass && selectedSubject && (
        <>
          {students.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-12 text-center">
              <p className="text-muted-foreground">No students found in this class.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 p-4 border-b border-border bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Student</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admission</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">/{getSelectedExamTotal()}</span>
              </div>

              {students.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-[1fr_100px_100px_80px] gap-4 items-center px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xs font-bold text-primary">
                        {student.first_name[0]}{student.last_name[0]}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {student.first_name} {student.last_name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{student.admission_number}</span>
                  <input
                    type="number"
                    min="0"
                    max={getSelectedExamTotal()}
                    value={student.score}
                    onChange={(e) => updateScore(student.id, e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-xs text-muted-foreground text-right">/{getSelectedExamTotal()}</span>
                </div>
              ))}
            </div>
          )}

          {studentsWithScores.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                {studentsWithScores.length} student{studentsWithScores.length !== 1 ? "s" : ""} scored &middot; Average{" "}
                <span className="font-semibold text-foreground">{avgPercentage.toFixed(1)}%</span>
              </p>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Results"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
