"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Save, ChevronLeft, ChevronRight, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/platform/toast";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { cacheStudents, getCachedStudents } from "@/lib/db";
import { syncPendingData } from "@/lib/sync";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  status: "present" | "absent" | "late";
}

interface MyClassInfo {
  schoolId: string;
  classId: string;
  className: string;
}

export default function TeacherAttendancePage() {
  const { mutateAttendance } = useOfflineMutation();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [className, setClassName] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      // getUser() needs the network; fall back to the local session offline.
      const { data: { user } } = await supabase.auth.getUser();
      let uid = user?.id ?? null;
      if (!uid) {
        const { data: { session } } = await supabase.auth.getSession();
        uid = session?.user?.id ?? null;
      }
      if (!uid) { setLoading(false); return; }
      setUserId(uid);

      try {
        const { data: schoolMember, error: memberError } = await supabase
          .from("school_members")
          .select("school_id")
          .eq("user_id", uid)
          .eq("is_active", true)
          .limit(1)
          .single();
        if (memberError || !schoolMember) throw new Error("no membership");

        const { data: staffRecord, error: staffError } = await supabase
          .from("staff")
          .select("id")
          .eq("school_id", schoolMember.school_id)
          .eq("user_id", uid)
          .limit(1)
          .single();
        if (staffError || !staffRecord) throw new Error("no staff record");

        const { data: classTeachers, error: ctError } = await supabase
          .from("class_teachers")
          .select("class_id, classes(name, grades(name))")
          .eq("staff_id", staffRecord.id);
        if (ctError) throw new Error("class lookup failed");

        const firstClass = classTeachers?.[0];
        if (!firstClass) throw new Error("no class assigned");

        const resolvedClassName =
          `${(firstClass.classes as { grades?: { name?: string } })?.grades?.name ?? ""} ${(firstClass.classes as { name?: string })?.name ?? ""}`.trim();

        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("id, first_name, last_name")
          .eq("class_id", firstClass.class_id)
          .eq("is_active", true)
          .order("last_name");
        if (studentsError) throw new Error("students lookup failed");

        const studentIds = studentsData?.map((s) => s.id) ?? [];

        const { data: existingAttendance, error: attError } = await supabase
          .from("attendance_records")
          .select("student_id, status")
          .eq("date", selectedDate)
          .in("student_id", studentIds);
        if (attError) throw new Error("attendance lookup failed");

        const attendanceMap = new Map(existingAttendance?.map((a) => [a.student_id, a.status]));

        setSchoolId(schoolMember.school_id);
        setClassId(firstClass.class_id);
        setClassName(resolvedClassName);
        setStudents(
          (studentsData ?? []).map((s) => ({
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            status: (attendanceMap.get(s.id) as Student["status"]) ?? "present",
          }))
        );

        // Cache for offline use: class info on the device, students in IndexedDB.
        localStorage.setItem(
          `decimal_my_class_${uid}`,
          JSON.stringify({ schoolId: schoolMember.school_id, classId: firstClass.class_id, className: resolvedClassName } satisfies MyClassInfo)
        );
        await cacheStudents(
          (studentsData ?? []).map((s) => ({ ...s, school_id: schoolMember.school_id, class_id: firstClass.class_id }))
        );

        setOfflineNotice(null);
      } catch {
        // Offline fallback: serve the cached class list.
        const raw = localStorage.getItem(`decimal_my_class_${uid}`);
        if (!raw) {
          setOfflineNotice("You're offline and this device has no cached class yet. Reconnect once to cache it.");
          setLoading(false);
          return;
        }
        try {
          const info = JSON.parse(raw) as MyClassInfo;
          setSchoolId(info.schoolId);
          setClassId(info.classId);
          setClassName(info.className);
          const cached = (await getCachedStudents()).filter(
            (s) => s.class_id === info.classId && s.school_id === info.schoolId
          );
          setStudents(
            cached.map((s) => ({
              id: String(s.id),
              first_name: String(s.first_name ?? ""),
              last_name: String(s.last_name ?? ""),
              status: "present" as const,
            }))
          );
          setOfflineNotice(
            "Offline — showing your cached class. Previously saved statuses for this date aren't available until you're back online."
          );
        } catch {
          setOfflineNotice("Offline — cached class data is unreadable.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedDate]);

  const updateStatus = (id: string, status: Student["status"]) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const saveAttendance = async () => {
    if (students.length === 0 || !schoolId || !userId) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const offlineRecords = students.map((s) => ({
        id: crypto.randomUUID(),
        school_id: schoolId,
        class_id: classId,
        date: selectedDate,
        student_id: s.id,
        status: s.status,
        recorded_by: userId,
        synced: false,
        created_at: now,
        _synced_at: now,
      }));

      if (isOnline) {
        // Fast path: write directly (includes class_id, added in migration 023).
        const supabase = createClient();
        const { error } = await supabase.from("attendance_records").upsert(
          offlineRecords.map(({ id: _id, synced: _synced, created_at: _c, _synced_at: _s, ...r }) => r),
          { onConflict: "student_id,date" }
        );
        if (!error) {
          toast("Attendance saved");
          return;
        }
        console.error("[attendance] direct save failed, queueing offline:", error.message);
      }

      // Offline (or the write failed): queue locally; the sync engine sends
      // them to the conflict-aware endpoint, so nothing overwrites blindly.
      for (const record of offlineRecords) {
        await mutateAttendance(record);
      }
      if (isOnline) await syncPendingData();
      toast(
        isOnline
          ? "Saved offline — will retry automatically"
          : "Saved offline — will sync when you're back online"
      );
    } finally {
      setSaving(false);
    }
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
        <Button size="sm" onClick={saveAttendance} disabled={saving || students.length === 0}>
          <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {(!isOnline || offlineNotice) && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          {offlineNotice ?? "You're offline — saves will queue and sync automatically."}
        </div>
      )}

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
