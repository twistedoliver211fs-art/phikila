"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface Period {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  position: number;
}

interface Class {
  id: string;
  name: string;
  grades: { name: string }[];
}

interface Subject {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
}

interface Room {
  id: string;
  name: string;
}

interface TimetableSlot {
  id?: string;
  period_id: string;
  day_of_week: number;
  class_id: string;
  subject_id: string;
  staff_id: string;
  room_id: string;
}

export default function PrincipalTimetablePage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("school_members").select("school_id").eq("user_id", user.id).eq("is_active", true).limit(1).single().then(async ({ data: sm }) => {
        if (!sm) return;
        setSchoolId(sm.school_id);

        const [periodsRes, classesRes, subjectsRes, staffRes, roomsRes, slotsRes] = await Promise.all([
          supabase.from("periods").select("*").eq("school_id", sm.school_id).order("position"),
          supabase.from("classes").select("id, name, grades(name)").eq("school_id", sm.school_id),
          supabase.from("subjects").select("id, name").eq("school_id", sm.school_id),
          supabase.from("staff").select("id, first_name, last_name").eq("school_id", sm.school_id).eq("is_active", true),
          supabase.from("rooms").select("id, name").eq("school_id", sm.school_id),
          supabase.from("timetable_slots").select("*").eq("school_id", sm.school_id),
        ]);

        setPeriods(periodsRes.data ?? []);
        setClasses(classesRes.data ?? []);
        setSubjects(subjectsRes.data ?? []);
        setStaff(staffRes.data ?? []);
        setRooms(roomsRes.data ?? []);
        setSlots(slotsRes.data ?? []);
        setLoading(false);
      });
    });
  }, []);

  const getSlot = (periodId: string, dayOfWeek: number) =>
    slots.find((s) => s.period_id === periodId && s.day_of_week === dayOfWeek);

  const updateSlot = (periodId: string, dayOfWeek: number, field: string, value: string) => {
    setSlots((prev) => {
      const existing = prev.findIndex((s) => s.period_id === periodId && s.day_of_week === dayOfWeek);
      const newSlot = {
        ...(prev[existing] ?? { period_id: periodId, day_of_week: dayOfWeek, class_id: "", subject_id: "", staff_id: "", room_id: "" }),
        [field]: value,
      };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newSlot;
        return updated;
      }
      return [...prev, newSlot];
    });
  };

  const removeSlot = (periodId: string, dayOfWeek: number) => {
    setSlots((prev) => prev.filter((s) => !(s.period_id === periodId && s.day_of_week === dayOfWeek)));
  };

  const saveTimetable = async () => {
    if (!schoolId) return;
    const supabase = createClient();

    const toSave = slots
      .filter((s) => s.class_id && s.subject_id && s.staff_id)
      .map((s) => ({ ...s, school_id: schoolId }));

    await supabase.from("timetable_slots").delete().eq("school_id", schoolId);
    if (toSave.length > 0) {
      await supabase.from("timetable_slots").insert(toSave);
    }
    alert("Timetable saved!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage the weekly timetable</p>
        </div>
        <Button size="sm" onClick={saveTimetable}><Save className="mr-2 h-4 w-4" />Save Timetable</Button>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day, idx) => (
          <button
            key={day}
            onClick={() => setSelectedDay(idx + 1)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDay === idx + 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : periods.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No periods configured. Ask your admin to set up periods first.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 text-left font-medium text-muted-foreground w-32">Period</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Class</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Subject</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Teacher</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Room</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => {
                  const slot = getSlot(period.id, selectedDay);
                  return (
                    <tr key={period.id} className="border-b border-border/50 last:border-0">
                      <td className="p-3">
                        <p className="font-medium text-foreground text-xs">{period.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
                        </p>
                      </td>
                      <td className="p-3">
                        <select
                          value={slot?.class_id ?? ""}
                          onChange={(e) => updateSlot(period.id, selectedDay, "class_id", e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">—</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {(c.grades as any)?.[0]?.name ?? ""} {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={slot?.subject_id ?? ""}
                          onChange={(e) => updateSlot(period.id, selectedDay, "subject_id", e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">—</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={slot?.staff_id ?? ""}
                          onChange={(e) => updateSlot(period.id, selectedDay, "staff_id", e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">—</option>
                          {staff.map((s) => (
                            <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={slot?.room_id ?? ""}
                          onChange={(e) => updateSlot(period.id, selectedDay, "room_id", e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">—</option>
                          {rooms.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        {slot && (slot.class_id || slot.subject_id) && (
                          <button
                            onClick={() => removeSlot(period.id, selectedDay)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
    </div>
  );
}
