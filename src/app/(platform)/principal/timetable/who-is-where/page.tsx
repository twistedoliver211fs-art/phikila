"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, Download, Printer, MapPin, Users, BookOpen } from "lucide-react";

interface Period {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  position: number;
}

interface TimetableSlot {
  id: string;
  day_of_week: string;
  period_id: string;
  class_id: string;
  subject_id: string;
  room_id: string;
  staff_id: string;
  period?: Period;
  class?: { id: string; name: string };
  subject?: { id: string; name: string };
  room?: { id: string; name: string };
  staff?: { id: string; first_name: string; last_name: string };
}

interface BreakTime {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_type: string;
  days: string[];
}

interface TeacherLocation {
  teacherId: string;
  teacherName: string;
  className?: string;
  subject?: string;
  room?: string;
  status: "teaching" | "free";
}

interface ClassStatus {
  classId: string;
  className: string;
  subject?: string;
  teacher?: string;
  room?: string;
  status: "teaching" | "free";
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WhosWherePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [breaks, setBreaks] = useState<BreakTime[]>([]);
  const [teacherLocations, setTeacherLocations] = useState<TeacherLocation[]>([]);
  const [classStatuses, setClassStatuses] = useState<ClassStatus[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [loading, setLoading] = useState(true);

  const getTimeString = useCallback(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  }, []);

  const getDayName = useCallback(() => {
    const now = new Date();
    return DAY_NAMES[now.getDay()];
  }, []);

  const isBreak = useCallback(
    (time: string) => {
      const dayName = getDayName();
      return breaks.some(
        (b) =>
          b.start_time <= time &&
          b.end_time >= time &&
          b.days.includes(dayName)
      );
    },
    [breaks, getDayName]
  );

  const loadTimetable = useCallback(async () => {
    const supabase = createClient();

    const [slotsRes, periodsRes, breaksRes] = await Promise.all([
      supabase
        .from("timetable_slots")
        .select(`
          *,
          period:periods(id, name, start_time, end_time, position),
          class:classes(id, name),
          subject:subjects(id, name),
          room:rooms(id, name),
          staff:staff(id, first_name, last_name)
        `),
      supabase
        .from("periods")
        .select("*")
        .order("position", { ascending: true }),
      supabase
        .from("breaks")
        .select("*"),
    ]);

    if (slotsRes.data) setSlots(slotsRes.data as unknown as TimetableSlot[]);
    if (periodsRes.data) setPeriods(periodsRes.data);
    if (breaksRes.data) setBreaks(breaksRes.data);
  }, []);

  const computeStatus = useCallback(() => {
    const time = getTimeString();
    const day = getDayName();
    setCurrentTime(time);
    setCurrentDay(day);

    const activePeriod = periods.find(
      (p) => p.start_time <= time && p.end_time >= time
    );
    setCurrentPeriod(activePeriod ?? null);

    if (!activePeriod) {
      setTeacherLocations([]);
      setClassStatuses([]);
      return;
    }

    const daySlots = slots.filter(
      (s) => s.day_of_week === day && s.period_id === activePeriod.id
    );

    const teacherMap = new Map<string, TeacherLocation>();
    slots
      .filter((s) => s.day_of_week === day)
      .forEach((s) => {
        if (s.staff) {
          const key = s.staff.id;
          if (!teacherMap.has(key)) {
            teacherMap.set(key, {
              teacherId: key,
              teacherName: `${s.staff.first_name} ${s.staff.last_name}`,
              status: "free",
            });
          }
        }
      });

    daySlots.forEach((slot) => {
      if (slot.staff) {
        const key = slot.staff.id;
        teacherMap.set(key, {
          teacherId: key,
          teacherName: `${slot.staff.first_name} ${slot.staff.last_name}`,
          className: slot.class?.name,
          subject: slot.subject?.name,
          room: slot.room?.name,
          status: "teaching",
        });
      }
    });

    const classMap = new Map<string, ClassStatus>();
    slots
      .filter((s) => s.day_of_week === day)
      .forEach((s) => {
        if (s.class) {
          const key = s.class.id;
          if (!classMap.has(key)) {
            classMap.set(key, {
              classId: key,
              className: s.class.name,
              status: "free",
            });
          }
        }
      });

    daySlots.forEach((slot) => {
      if (slot.class) {
        classMap.set(slot.class.id, {
          classId: slot.class.id,
          className: slot.class.name,
          subject: slot.subject?.name,
          teacher: slot.staff
            ? `Mr/Ms ${slot.staff.last_name}`
            : undefined,
          room: slot.room?.name,
          status: "teaching",
        });
      }
    });

    setTeacherLocations(
      Array.from(teacherMap.values()).sort((a, b) =>
        a.teacherName.localeCompare(b.teacherName)
      )
    );
    setClassStatuses(
      Array.from(classMap.values()).sort((a, b) =>
        a.className.localeCompare(b.className)
      )
    );
  }, [slots, periods, getTimeString, getDayName]);

  useEffect(() => {
    loadTimetable().then(() => setLoading(false));
  }, [loadTimetable]);

  useEffect(() => {
    computeStatus();
    const interval = setInterval(computeStatus, 60000);
    return () => clearInterval(interval);
  }, [computeStatus]);

  useEffect(() => {
    const interval = setInterval(loadTimetable, 300000);
    return () => clearInterval(interval);
  }, [loadTimetable]);

  const pastPeriods = periods.filter((p) => p.end_time < currentTime);
  const nextPeriod = periods.find((p) => p.start_time > currentTime);
  const isCurrentlyBreak = isBreak(currentTime);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Who&apos;s Where</h1>
          <p className="text-muted-foreground">
            {currentDay},{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            — Time: {currentTime}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTimetable}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold mb-1">
          {currentPeriod
            ? `Current Period: ${currentPeriod.name} (${currentPeriod.start_time} – ${currentPeriod.end_time})`
            : isCurrentlyBreak
              ? "Break Time"
              : "No Active Period"}
        </h2>
        {nextPeriod && !currentPeriod && !isCurrentlyBreak && (
          <p className="text-sm text-muted-foreground">
            Next: {nextPeriod.name} starts at {nextPeriod.start_time}
          </p>
        )}
        {pastPeriods.length > 0 && (
          <div className="flex gap-1 mt-2">
            {pastPeriods.map((p) => (
              <span
                key={p.id}
                className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Teachers</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {teacherLocations.filter((t) => t.status === "teaching").length}{" "}
              teaching / {teacherLocations.length} total
            </span>
          </div>
          <div className="divide-y">
            {teacherLocations.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                No staff data available
              </p>
            )}
            {teacherLocations.map((t) => (
              <div
                key={t.teacherId}
                className="flex items-center justify-between p-3 px-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.teacherName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.status === "teaching" ? (
                      <>
                        {t.className} ({t.subject})
                      </>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">
                        (Free)
                      </span>
                    )}
                  </p>
                </div>
                {t.room && (
                  <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                    {t.room}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b p-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Classes</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {classStatuses.filter((c) => c.status === "teaching").length} in
              session / {classStatuses.length} total
            </span>
          </div>
          <div className="divide-y">
            {classStatuses.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                No class data available
              </p>
            )}
            {classStatuses.map((c) => (
              <div
                key={c.classId}
                className="flex items-center justify-between p-3 px-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.className}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.status === "teaching" ? (
                      <>
                        {c.subject} ({c.teacher})
                      </>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">
                        (Free period)
                      </span>
                    )}
                  </p>
                </div>
                {c.room && (
                  <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {c.room}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
