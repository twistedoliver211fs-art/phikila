"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  term_id: string;
  total_marks: number;
}

interface ExamResult {
  exam_id: string;
  student_id: string;
  subject_id: string;
  score: number;
  grade: string;
  percentage: number | null;
}

interface Student {
  id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string;
}

interface Class {
  id: string;
  name: string;
  grades: { name: string }[];
}

interface Subject {
  id: string;
  name: string;
  school_id: string;
}

interface Insight {
  type: "positive" | "negative" | "warning";
  text: string;
}

export default function PerformanceAnalysisPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

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
          setSchoolId(sm.school_id);

          const [examsRes, studentsRes, classesRes, subjectsRes] =
            await Promise.all([
              supabase
                .from("exams")
                .select("id, name, exam_date, term_id, total_marks")
                .eq("school_id", sm.school_id)
                .order("exam_date", { ascending: false }),
              supabase
                .from("students")
                .select("id, school_id, first_name, last_name, admission_number, class_id")
                .eq("school_id", sm.school_id),
              supabase
                .from("classes")
                .select("id, name, grades(name)")
                .eq("school_id", sm.school_id),
              supabase
                .from("subjects")
                .select("id, name, school_id")
                .eq("school_id", sm.school_id),
            ]);

          setExams(examsRes.data ?? []);
          setStudents(studentsRes.data ?? []);
          setClasses(classesRes.data ?? []);
          setSubjects(subjectsRes.data ?? []);

          if (examsRes.data && examsRes.data.length > 0) {
            setSelectedExamId(examsRes.data[0].id);
          } else {
            setLoading(false);
          }
        });
    });
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    const supabase = createClient();
    supabase
      .from("exam_results")
      .select("exam_id, student_id, subject_id, score, grade, percentage")
      .eq("exam_id", selectedExamId)
      .then(({ data }) => {
        setExamResults(data ?? []);
        setLoading(false);
      });
  }, [selectedExamId]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const schoolAvg = useMemo(() => {
    if (examResults.length === 0) return 0;
    const total = examResults.reduce(
      (sum, r) => sum + (r.percentage ?? 0),
      0
    );
    return Math.round((total / examResults.length) * 10) / 10;
  }, [examResults]);

  const totalStudents = students.length;

  const passRate = useMemo(() => {
    if (examResults.length === 0) return 0;
    const passed = examResults.filter(
      (r) => (r.percentage ?? 0) >= 50
    ).length;
    return Math.round((passed / examResults.length) * 100);
  }, [examResults]);

  const classData = useMemo(() => {
    return classes.map((cls) => {
      const classStudents = students.filter((s) => s.class_id === cls.id);
      const classResults = examResults.filter((r) =>
        classStudents.some((s) => s.id === r.student_id)
      );
      const avg =
        classResults.length > 0
          ? classResults.reduce(
              (sum, r) => sum + (r.percentage ?? 0),
              0
            ) / classResults.length
          : 0;
      return { name: cls.name, avg: Math.round(avg * 10) / 10 };
    });
  }, [classes, students, examResults]);

  const subjectData = useMemo(() => {
    return subjects.map((sub) => {
      const subResults = examResults.filter((r) => r.subject_id === sub.id);
      const avg =
        subResults.length > 0
          ? subResults.reduce(
              (sum, r) => sum + (r.percentage ?? 0),
              0
            ) / subResults.length
          : 0;
      return { name: sub.name, avg: Math.round(avg * 10) / 10 };
    });
  }, [subjects, examResults]);

  const studentRankings = useMemo(() => {
    const avgMap = new Map<
      string,
      { student: Student; avg: number; count: number }
    >();
    for (const r of examResults) {
      const existing = avgMap.get(r.student_id);
      if (existing) {
        existing.avg += r.percentage ?? 0;
        existing.count += 1;
      } else {
        const student = students.find((s) => s.id === r.student_id);
        if (student) {
          avgMap.set(r.student_id, {
            student,
            avg: r.percentage ?? 0,
            count: 1,
          });
        }
      }
    }
    return Array.from(avgMap.values())
      .map(({ student, avg, count }) => ({
        ...student,
        avg: Math.round((avg / count) * 10) / 10,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [examResults, students]);

  const insights = useMemo(() => {
    const list: Insight[] = [];

    for (const c of classData) {
      if (c.avg > schoolAvg + 10) {
        list.push({
          type: "positive",
          text: `${c.name} scored ${Math.round(c.avg - schoolAvg)}% above school average`,
        });
      }
      if (c.avg < schoolAvg - 10) {
        list.push({
          type: "negative",
          text: `${c.name} scored ${Math.round(schoolAvg - c.avg)}% below school average`,
        });
      }
    }

    for (const s of subjectData) {
      if (s.avg > schoolAvg + 10) {
        list.push({
          type: "positive",
          text: `${s.name} is the strongest subject (avg ${s.avg}%)`,
        });
      }
      if (s.avg < schoolAvg - 10) {
        list.push({
          type: "negative",
          text: `${s.name} is the weakest subject (avg ${s.avg}%)`,
        });
      }
    }

    if (studentRankings.length > 0) {
      const top = studentRankings[0];
      list.push({
        type: "positive",
        text: `Top performer: ${top.first_name} ${top.last_name} (${top.avg}%)`,
      });
    }

    const bottom = studentRankings[studentRankings.length - 1];
    if (bottom && studentRankings.length > 1) {
      list.push({
        type: "warning",
        text: `Needs attention: ${bottom.first_name} ${bottom.last_name} (${bottom.avg}%)`,
      });
    }

    return list;
  }, [classData, subjectData, studentRankings, schoolAvg]);

  if (loading && !selectedExamId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Performance Analysis
          </h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Performance Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep-dive analytics with graphs and auto-generated insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label
            htmlFor="exam-select"
            className="text-sm font-medium text-foreground"
          >
            Exam:
          </label>
          <select
            id="exam-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 min-w-[200px]"
          >
            {exams.length === 0 && (
              <option value="">No exams available</option>
            )}
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
                {exam.exam_date ? ` — ${exam.exam_date}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2.5">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              School Average
            </p>
            <p className="text-xl font-bold text-foreground">
              {schoolAvg}%
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2.5">
            <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Students
            </p>
            <p className="text-xl font-bold text-foreground">
              {totalStudents}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2.5">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Pass Rate
            </p>
            <p className="text-xl font-bold text-foreground">
              {passRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">
              Class Performance
            </h2>
          </div>
          <div className="p-4">
            {classData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No class data available
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value}%`, "Average"]}
                    />
                    <Bar
                      dataKey="avg"
                      fill="hsl(217, 91%, 60%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Subject Performance */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">
              Subject Performance
            </h2>
          </div>
          <div className="p-4">
            {subjectData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No subject data available
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value}%`, "Average"]}
                    />
                    <Bar
                      dataKey="avg"
                      fill="hsl(142, 71%, 45%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Rankings */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">
            Student Rankings
          </h2>
        </div>
        {studentRankings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No student data available for this exam
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-medium text-muted-foreground w-16">
                    Rank
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Student
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Class
                  </th>
                  <th className="p-4 text-right font-medium text-muted-foreground">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentRankings.map((s, i) => {
                  const cls = classes.find((c) => c.id === s.class_id);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            i === 0
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : i === 1
                                ? "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
                                : i === 2
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {cls?.name ?? "—"}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-semibold ${
                            s.avg >= 70
                              ? "text-green-600 dark:text-green-400"
                              : s.avg >= 50
                                ? "text-foreground"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {s.avg}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">
              Auto-Generated Insights
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg p-3 text-sm ${
                  insight.type === "positive"
                    ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30"
                    : insight.type === "negative"
                      ? "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
                      : "bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30"
                }`}
              >
                {insight.type === "positive" ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                ) : insight.type === "negative" ? (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <span
                  className={
                    insight.type === "positive"
                      ? "text-green-700 dark:text-green-300"
                      : insight.type === "negative"
                        ? "text-red-700 dark:text-red-300"
                        : "text-amber-700 dark:text-amber-300"
                  }
                >
                  {insight.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
