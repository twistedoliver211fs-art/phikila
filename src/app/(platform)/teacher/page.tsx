import {
  Clock,
  ClipboardCheck,
  BookOpen,
  Briefcase,
  Megaphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function TeacherPage() {
  const supabase = await createClient();
  const schoolId = await getCurrentSchoolId();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("id, first_name")
    .eq("user_id", user!.id)
    .eq("school_id", schoolId)
    .single();

  const staffId = staffRecord?.id;
  const teacherName = staffRecord?.first_name ?? "Teacher";

  const today = new Date();
  const dayOfWeek = today.getDay();

  const { data: timetableSlots } = await supabase
    .from("timetable_slots")
    .select(`
      id,
      day_of_week,
      period:periods(name, start_time, end_time),
      subject:subjects(name),
      class:classes(name, grade:grades(name)),
      room:rooms(name)
    `)
    .eq("staff_id", staffId)
    .eq("day_of_week", dayOfWeek)
    .eq("school_id", schoolId)
    .order("period.start_time", { ascending: true });

  const todaySchedule = (timetableSlots ?? []).map((slot: any) => ({
    time: slot.period?.start_time?.slice(0, 5) ?? "??:??",
    subject: `${slot.class?.grade?.name ?? ""} ${slot.class?.name ?? ""} ${slot.subject?.name ?? ""}`.trim(),
    room: slot.room?.name ?? "—",
  }));

  const { count: totalLessons } = await supabase
    .from("timetable_slots")
    .select("id", { count: "exact", head: true })
    .eq("staff_id", staffId)
    .eq("school_id", schoolId);

  const { count: todayLessons } = await supabase
    .from("timetable_slots")
    .select("id", { count: "exact", head: true })
    .eq("staff_id", staffId)
    .eq("day_of_week", dayOfWeek)
    .eq("school_id", schoolId);

  const todayDate = today.toISOString().split("T")[0];

  const { data: todayClasses } = await supabase
    .from("timetable_slots")
    .select("class_id")
    .eq("staff_id", staffId)
    .eq("day_of_week", dayOfWeek)
    .eq("school_id", schoolId);

  const classIds = [...new Set((todayClasses ?? []).map((c: any) => c.class_id))];

  let attendanceNeeded = 0;
  if (classIds.length > 0) {
    const { count: recorded } = await supabase
      .from("attendance_records")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("recorded_by", user!.id)
      .eq("date", todayDate);

    attendanceNeeded = Math.max(0, classIds.length - (recorded ?? 0));
  }

  const { count: pendingMarks } = await supabase
    .from("announcements")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_published", true);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, author_id, created_at, profiles:author_id(full_name)")
    .eq("school_id", schoolId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const workload = totalLessons ?? 0;
  const maxCapacity = Math.ceil(workload / 0.8) || 24;
  const freeCapacity = Math.max(0, maxCapacity - workload);
  const workloadPct = maxCapacity > 0 ? ((workload / maxCapacity) * 100).toFixed(1) : "0";

  const tasks = [];
  if (attendanceNeeded > 0) {
    tasks.push({
      icon: ClipboardCheck,
      title: "Attendance pending",
      description: `${attendanceNeeded} class(es) need attendance taken`,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    });
  }
  if (pendingMarks && pendingMarks > 0) {
    tasks.push({
      icon: BookOpen,
      title: "Announcements",
      description: `${pendingMarks} published announcements`,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    });
  }

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {teacherName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your schedule for today.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Today&apos;s Schedule
          </h2>
        </div>
        {todaySchedule.length > 0 ? (
          <div className="space-y-2">
            {todaySchedule.map((slot) => (
              <div
                key={`${slot.time}-${slot.subject}`}
                className="flex items-center gap-4 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-mono font-medium text-muted-foreground w-12">
                  {slot.time}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {slot.subject}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{slot.room}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Tasks</h2>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.title}
                className={`flex items-center gap-3 rounded-lg border p-3 ${task.color}`}
              >
                <task.icon className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs opacity-80">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            My Workload
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{workload}</span>
              <span className="text-sm text-muted-foreground">/ {maxCapacity} lessons</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${workloadPct}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">
              {freeCapacity} free capacity
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Announcements
          </h2>
        </div>
        {announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a: any) => (
              <div key={a.id} className="rounded-lg border border-border/50 p-3">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {a.profiles?.full_name ? `From: ${a.profiles.full_name}` : "School"} —{" "}
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No announcements.</p>
        )}
      </div>
    </div>
  );
}
