"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ReportCard {
  id: string;
  studentId: string;
  examId: string;
  totalScore: number;
  averageScore: number;
  classRank: number | null;
  classSize: number | null;
  overallGrade: string | null;
  generatedAt: string;
  studentName?: string;
  className?: string;
}

interface Exam {
  id: string;
  name: string;
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
}

interface Term {
  id: string;
  name: string;
  is_current: boolean;
  academic_year_id: string;
}

interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
  F: "bg-red-100 text-red-800",
};

export default function ReportCardsPage() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

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

          const [examsRes, classesRes, termsRes, yearsRes] = await Promise.all([
            supabase
              .from("exams")
              .select("id, name, exam_date")
              .eq("school_id", sid)
              .order("exam_date", { ascending: false }),
            supabase
              .from("classes")
              .select("id, name, grades(name)")
              .eq("school_id", sid),
            supabase
              .from("terms")
              .select("id, name, is_current, academic_year_id, academic_years!inner(school_id)")
              .eq("academic_years.school_id", sid)
              .order("created_at", { ascending: false }),
            supabase
              .from("academic_years")
              .select("id, name, is_current")
              .eq("school_id", sid)
              .order("created_at", { ascending: false }),
          ]);

          setExams(examsRes.data ?? []);
          setClasses((classesRes.data ?? []) as unknown as ClassRow[]);
          setTerms((termsRes.data ?? []) as unknown as Term[]);
          setAcademicYears(yearsRes.data ?? []);
        });
    });
  }, []);

  useEffect(() => {
    if (reportCards.length === 0) return;
    const supabase = createClient();
    const ids = reportCards.map((rc) => rc.studentId);
    supabase
      .from("students")
      .select("id, first_name, last_name")
      .in("id", ids)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((s) => {
            map[s.id] = `${s.first_name} ${s.last_name}`;
          });
          setStudentNames(map);
        }
      });
  }, [reportCards]);

  useEffect(() => {
    if (!selectedClassId) return;
    const supabase = createClient();
    supabase
      .from("students")
      .select("id, first_name, last_name")
      .eq("class_id", selectedClassId)
      .eq("is_active", true)
      .order("last_name")
      .then(({ data }) => setStudents(data ?? []));
  }, [selectedClassId]);

  useEffect(() => {
    async function fetchReportCards() {
      try {
        const res = await fetch("/api/report-cards");
        if (res.ok) {
          const data = await res.json();
          setReportCards(data.reportCards ?? []);
        }
      } catch {
        console.error("Failed to fetch report cards");
      } finally {
        setLoading(false);
      }
    }
    fetchReportCards();
  }, []);

  const handleGenerate = async () => {
    if (!selectedExamId || !selectedClassId) return;
    setGenerating(true);
    setMessage(null);

    const activeTerm = terms.find((t) => t.is_current);
    const activeYear = academicYears.find((y) => y.is_current);
    if (!activeTerm || !activeYear) {
      setMessage({
        type: "error",
        text: "No active term or academic year found.",
      });
      setGenerating(false);
      return;
    }

    let generated = 0;
    let failed = 0;

    for (const student of students) {
      try {
        const res = await fetch("/api/report-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            examId: selectedExamId,
            classId: selectedClassId,
            academicYearId: activeYear.id,
            termId: activeTerm.id,
          }),
        });
        if (res.ok) generated++;
        else failed++;
      } catch {
        failed++;
      }
    }

    if (generated > 0) {
      setMessage({
        type: "success",
        text: `Generated ${generated} report card${generated !== 1 ? "s" : ""}${failed > 0 ? `. ${failed} failed.` : "."}`,
      });
      const res = await fetch("/api/report-cards");
      if (res.ok) {
        const data = await res.json();
        setReportCards(data.reportCards ?? []);
      }
    } else {
      setMessage({ type: "error", text: "Failed to generate report cards." });
    }

    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Cards</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage student report cards
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report Cards
        </Button>
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
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : reportCards.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No report cards generated yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Generate Report Cards&quot; to create your first batch.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="p-3 text-left font-medium text-muted-foreground">
                      Average
                    </th>
                    <th className="p-3 text-left font-medium text-muted-foreground">
                      Grade
                    </th>
                    <th className="p-3 text-left font-medium text-muted-foreground">
                      Rank
                    </th>
                    <th className="p-3 text-left font-medium text-muted-foreground">
                      Generated
                    </th>
                    <th className="p-3 text-left font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportCards.map((rc) => (
                    <tr
                      key={rc.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3 font-medium text-foreground">
                        {studentNames[rc.studentId] ?? rc.studentId.slice(0, 8) + "..."}
                      </td>
                      <td className="p-3 text-foreground">
                        {rc.averageScore.toFixed(1)}%
                      </td>
                      <td className="p-3">
                        <Badge
                          className={`${gradeColors[rc.overallGrade ?? "F"] ?? "bg-gray-100 text-gray-800"} text-xs`}
                        >
                          {rc.overallGrade ?? "N/A"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {rc.classRank && rc.classSize
                          ? `${rc.classRank}/${rc.classSize}`
                          : "N/A"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(rc.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Link href={`/principal/report-cards/${rc.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md mx-4 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Generate Report Cards
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Exam
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select exam</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.grades ? `${cls.grades.name} ` : ""}
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedClassId && students.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  This will generate report cards for {students.length} student
                  {students.length !== 1 ? "s" : ""} in this class.
                </p>
              )}
              {selectedClassId && students.length === 0 && (
                <p className="text-xs text-destructive">
                  No active students found in this class.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={
                  !selectedExamId || !selectedClassId || generating || students.length === 0
                }
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
