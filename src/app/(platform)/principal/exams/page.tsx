"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  BarChart3,
  X,
  TrendingUp,
  Award,
  Users,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  exam_type: string;
  total_marks: number;
  term_id: string;
  created_at: string;
  school_id: string;
}

interface ExamResult {
  exam_id: string;
  student_id: string;
  subject_id: string;
  score: number | null;
  grade: string | null;
  percentage: number | null;
}

interface ClassRow {
  id: string;
  name: string;
  grades: { name: string } | null;
}

interface StudentRow {
  id: string;
  class_id: string;
}

interface TermRow {
  id: string;
  name: string;
  is_active: boolean;
}

const EXAM_TYPES = [
  "midterm",
  "endterm",
  "cat",
  "assignment",
  "mock",
  "custom",
] as const;

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444", "#8b5cf6"];

const GRADE_ORDER = ["A", "B", "C", "D", "E", "F"];

export default function PrincipalExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [activeTerm, setActiveTerm] = useState<TermRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newExam, setNewExam] = useState({
    name: "",
    exam_type: "midterm",
    exam_date: "",
    total_marks: 100,
  });

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

          const [examsRes, classesRes, studentsRes, termsRes] = await Promise.all([
            supabase
              .from("exams")
              .select("*")
              .eq("school_id", sid)
              .order("exam_date", { ascending: false }),
            supabase
              .from("classes")
              .select("id, name, grades(name)")
              .eq("school_id", sid),
            supabase
              .from("students")
              .select("id, class_id")
              .eq("school_id", sid)
              .eq("is_active", true),
            supabase
              .from("terms")
              .select("id, name, is_active")
              .eq("school_id", sid)
              .eq("is_active", true)
              .limit(1)
              .single(),
          ]);

          const examList = (examsRes.data ?? []) as Exam[];
          setExams(examList);
          setClasses((classesRes.data ?? []) as unknown as ClassRow[]);
          setStudents((studentsRes.data ?? []) as StudentRow[]);
          setActiveTerm(termsRes.data as TermRow | null);

          if (examList.length > 0) {
            const examIds = examList.map((e) => e.id);
            const { data: results } = await supabase
              .from("exam_results")
              .select("exam_id, student_id, subject_id, score, grade, percentage")
              .in("exam_id", examIds);
            setExamResults((results ?? []) as ExamResult[]);
          }

          setLoading(false);
        });
    });
  }, []);

  const filteredExams = useMemo(() => {
    if (!activeTerm) return exams;
    return exams.filter((e) => e.term_id === activeTerm.id);
  }, [exams, activeTerm]);

  const stats = useMemo(() => {
    const total = filteredExams.length;
    const results = examResults.filter((r) =>
      filteredExams.some((e) => e.id === r.exam_id)
    );
    const percentages = results
      .map((r) => r.percentage)
      .filter((p): p is number => p != null);
    const avg =
      percentages.length > 0
        ? percentages.reduce((a, b) => a + b, 0) / percentages.length
        : 0;
    const highest = percentages.length > 0 ? Math.max(...percentages) : 0;
    const passCount = percentages.filter((p) => p >= 50).length;
    const passRate =
      percentages.length > 0 ? (passCount / percentages.length) * 100 : 0;
    return { total, avg, highest, passRate };
  }, [filteredExams, examResults]);

  const trendData = useMemo(() => {
    return filteredExams
      .slice()
      .reverse()
      .map((exam) => {
        const results = examResults.filter((r) => r.exam_id === exam.id);
        const pcts = results
          .map((r) => r.percentage)
          .filter((p): p is number => p != null);
        const avg =
          pcts.length > 0
            ? pcts.reduce((a, b) => a + b, 0) / pcts.length
            : 0;
        return { name: exam.name, avg: Math.round(avg * 10) / 10 };
      });
  }, [filteredExams, examResults]);

  const classData = useMemo(() => {
    const studentClassMap = new Map<string, string>();
    students.forEach((s) => studentClassMap.set(s.id, s.class_id));

    return classes.map((cls) => {
      const classStudentIds = students
        .filter((s) => s.class_id === cls.id)
        .map((s) => s.id);
      const results = examResults.filter(
        (r) =>
          classStudentIds.includes(r.student_id) &&
          filteredExams.some((e) => e.id === r.exam_id)
      );
      const pcts = results
        .map((r) => r.percentage)
        .filter((p): p is number => p != null);
      const avg =
        pcts.length > 0
          ? pcts.reduce((a, b) => a + b, 0) / pcts.length
          : 0;
      const label = cls.grades
        ? `${cls.grades.name} ${cls.name}`
        : cls.name;
      return { name: label, avg: Math.round(avg * 10) / 10 };
    });
  }, [classes, students, examResults, filteredExams]);

  const gradeDistribution = useMemo(() => {
    const results = examResults.filter((r) =>
      filteredExams.some((e) => e.id === r.exam_id)
    );
    const counts = new Map<string, number>();
    results.forEach((r) => {
      if (r.grade) counts.set(r.grade, (counts.get(r.grade) ?? 0) + 1);
    });
    return GRADE_ORDER.filter((g) => counts.has(g)).map((g) => ({
      name: g,
      value: counts.get(g)!,
    }));
  }, [filteredExams, examResults]);

  const recentExams = filteredExams.slice(0, 8);

  const handleCreateExam = async () => {
    if (!newExam.name || !newExam.exam_date) return;
    setCreating(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: sm } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .single();
    if (!sm) return;

    await supabase.from("exams").insert({
      name: newExam.name,
      exam_type: newExam.exam_type,
      exam_date: newExam.exam_date,
      total_marks: newExam.total_marks,
      school_id: sm.school_id,
      term_id: activeTerm?.id ?? null,
    });

    setNewExam({ name: "", exam_type: "midterm", exam_date: "", total_marks: 100 });
    setShowCreateModal(false);
    setCreating(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-sm">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams & Results</h1>
          <p className="text-muted-foreground mt-1">
            {activeTerm ? activeTerm.name : "All terms"} &mdash; Performance
            overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Exams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.avg.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.highest}%
              </p>
              <p className="text-xs text-muted-foreground">Highest Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Percent className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.passRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3b82f6" }}
                  activeDot={{ r: 6 }}
                  name="Avg %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              No exam data to display.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Class Comparison + Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {classData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No class data available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {gradeDistribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3">
                  {gradeDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No grade data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Exam
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Avg
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Students
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentExams.map((exam) => {
                    const results = examResults.filter(
                      (r) => r.exam_id === exam.id
                    );
                    const pcts = results
                      .map((r) => r.percentage)
                      .filter((p): p is number => p != null);
                    const avg =
                      pcts.length > 0
                        ? pcts.reduce((a, b) => a + b, 0) / pcts.length
                        : 0;
                    return (
                      <tr
                        key={exam.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 font-medium text-foreground">
                          {exam.name}
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary" className="capitalize">
                            {exam.exam_type}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {exam.exam_date
                            ? new Date(exam.exam_date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : "—"}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {avg > 0 ? `${avg.toFixed(1)}%` : "—"}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Set(results.map((r) => r.student_id)).size || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No exams created yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first exam to start recording results.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md mx-4 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Create Exam
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={newExam.name}
                  onChange={(e) =>
                    setNewExam((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Midterm 2, CAT 1"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Exam Type
                </label>
                <select
                  value={newExam.exam_type}
                  onChange={(e) =>
                    setNewExam((prev) => ({
                      ...prev,
                      exam_type: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={newExam.exam_date}
                  onChange={(e) =>
                    setNewExam((prev) => ({
                      ...prev,
                      exam_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Total Marks
                </label>
                <input
                  type="number"
                  min={1}
                  value={newExam.total_marks}
                  onChange={(e) =>
                    setNewExam((prev) => ({
                      ...prev,
                      total_marks: Number(e.target.value) || 100,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateExam}
                disabled={!newExam.name || !newExam.exam_date || creating}
              >
                {creating ? "Creating..." : "Create Exam"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
