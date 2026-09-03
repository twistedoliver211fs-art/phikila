"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClassAttendance {
  class_name: string;
  teacher_name: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export default function PrincipalAttendancePage() {
  const [classes, setClasses] = useState<ClassAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchAttendance() {
      setLoading(true);

      const { data: schoolMember } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!schoolMember) {
        setLoading(false);
        return;
      }

      const { data: classesData } = await supabase
        .from("classes")
        .select("id, name, grades(name)")
        .eq("school_id", schoolMember.school_id);

      if (!classesData) {
        setLoading(false);
        return;
      }

      const results: ClassAttendance[] = [];

      for (const cls of classesData) {
        const { data: students } = await supabase
          .from("students")
          .select("id")
          .eq("class_id", cls.id)
          .eq("is_active", true);

        const studentIds = students?.map((s) => s.id) ?? [];

        const { data: attendance } = await supabase
          .from("attendance_records")
          .select("status")
          .eq("date", selectedDate)
          .in("student_id", studentIds);

        const present = attendance?.filter((a) => a.status === "present").length ?? 0;
        const absent = attendance?.filter((a) => a.status === "absent").length ?? 0;
        const late = attendance?.filter((a) => a.status === "late").length ?? 0;

        results.push({
          class_name: `${(cls.grades as any)?.name ?? ""} ${cls.name}`.trim(),
          teacher_name: "—",
          present,
          absent,
          late,
          total: students?.length ?? 0,
        });
      }

      setClasses(results);
      setLoading(false);
    }

    fetchAttendance();
  }, [selectedDate]);

  const totalPresent = classes.reduce((a, c) => a + c.present, 0);
  const totalAbsent = classes.reduce((a, c) => a + c.absent, 0);
  const totalLate = classes.reduce((a, c) => a + c.late, 0);
  const totalStudents = classes.reduce((a, c) => a + c.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Overview</h1>
          <p className="text-muted-foreground mt-1">School-wide attendance for {selectedDate}</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Present</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{totalPresent}</p>
          <p className="text-xs text-green-600">
            {totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0}% rate
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Absent</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{totalAbsent}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Late</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{totalLate}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Class Breakdown</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading attendance data...</div>
        ) : classes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No classes found. Set up your classes first.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Present</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Absent</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Late</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Rate</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.class_name} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{c.class_name}</td>
                    <td className="p-4 text-green-600 font-medium">{c.present}</td>
                    <td className="p-4 text-red-600 font-medium">{c.absent}</td>
                    <td className="p-4 text-amber-600 font-medium">{c.late}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${c.total > 0 ? (c.present / c.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {c.total > 0 ? ((c.present / c.total) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
