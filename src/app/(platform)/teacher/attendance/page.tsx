"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  status: "present" | "absent" | "late";
}

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: schoolMember } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!schoolMember) { setLoading(false); return; }

      const { data: staffRecord } = await supabase
        .from("staff")
        .select("id")
        .eq("school_id", schoolMember.school_id)
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!staffRecord) { setLoading(false); return; }

      const { data: classTeachers } = await supabase
        .from("class_teachers")
        .select("class_id, classes(name, grades(name))")
        .eq("staff_id", staffRecord.id);

      const firstClass = classTeachers?.[0];
      if (!firstClass) { setLoading(false); return; }

      setClassName(`${(firstClass.classes as any)?.grades?.name ?? ""} ${(firstClass.classes as any)?.name ?? ""}`.trim());

      const { data: studentsData } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .eq("class_id", firstClass.class_id)
        .eq("is_active", true)
        .order("last_name");

      const studentIds = studentsData?.map((s) => s.id) ?? [];

      const { data: existingAttendance } = await supabase
        .from("attendance_records")
        .select("student_id, status")
        .eq("date", selectedDate)
        .in("student_id", studentIds);

      const attendanceMap = new Map(existingAttendance?.map((a) => [a.student_id, a.status]));

      setStudents(
        (studentsData ?? []).map((s) => ({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          status: (attendanceMap.get(s.id) as Student["status"]) ?? "present",
        }))
      );
      setLoading(false);
    }

    fetchData();
  }, [selectedDate]);

  const updateStatus = (id: string, status: Student["status"]) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const saveAttendance = async () => {
    const supabase = createClient();
    const records = students.map((s) => ({
      student_id: s.id,
      date: selectedDate,
      status: s.status,
    }));

    await supabase.from("attendance_records").upsert(records, {
      onConflict: "student_id,date",
    });

    alert("Attendance saved!");
  };

  const present = students.filter((s) => s.status === "present").length;
  const absent = students.filter((s) => s.status === "absent").length;
  const late = students.filter((s) => s.status === "late").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">{className || "Loading..."}</p>
        </div>
        <Button size="sm" onClick={saveAttendance}>
          <Save className="mr-2 h-4 w-4" />Save
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() - 1);
          setSelectedDate(d.toISOString().split("T")[0]);
        }}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-foreground">{selectedDate}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() + 1);
          setSelectedDate(d.toISOString().split("T")[0]);
        }}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{present}</p>
          <p className="text-xs font-medium text-green-600">Present</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{absent}</p>
          <p className="text-xs font-medium text-red-600">Absent</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{late}</p>
          <p className="text-xs font-medium text-amber-600">Late</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading students...</div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-4 p-4 border-b border-border bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Student</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
          </div>
          {students.map((student) => (
            <div key={student.id} className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
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
              <div className="flex gap-1">
                {(["present", "absent", "late"] as const).map((status) => {
                  const colors = {
                    present: student.status === status ? "bg-green-500 text-white" : "bg-green-50 text-green-700",
                    absent: student.status === status ? "bg-red-500 text-white" : "bg-red-50 text-red-700",
                    late: student.status === status ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700",
                  };
                  const icons = { present: CheckCircle, absent: XCircle, late: Clock };
                  const Icon = icons[status];
                  return (
                    <button
                      key={status}
                      onClick={() => updateStatus(student.id, status)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${colors[status]}`}
                    >
                      <Icon className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
