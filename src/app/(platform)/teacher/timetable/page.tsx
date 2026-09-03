import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { Clock, MapPin } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default async function TeacherTimetablePage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user?.id)
    .limit(1)
    .single();

  const { data: slots } = await supabase
    .from("timetable_slots")
    .select(`
      id, day_of_week, period_id, class_id, subject_id, room_id,
      periods(name, start_time, end_time),
      classes(name, grades(name)),
      subjects(name),
      rooms(name)
    `)
    .eq("school_id", schoolId)
    .eq("staff_id", staffRecord?.id ?? "00000000-0000-0000-0000-000000000000");

  const { data: allPeriods } = await supabase
    .from("periods")
    .select("id, name, start_time, end_time, position")
    .eq("school_id", schoolId)
    .order("position");

  const timetable: Record<number, Record<number, any>> = {};
  slots?.forEach((slot) => {
    if (!timetable[slot.day_of_week]) timetable[slot.day_of_week] = {};
    timetable[slot.day_of_week][slot.period_id] = slot;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
        <p className="text-muted-foreground mt-1">Your weekly teaching schedule</p>
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left font-medium text-muted-foreground w-32">Period</th>
                {days.map((day, idx) => (
                  <th key={day} className="p-3 text-left font-medium text-muted-foreground">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPeriods && allPeriods.length > 0 ? (
                allPeriods.map((period) => (
                  <tr key={period.id} className="border-b border-border/50 last:border-0">
                    <td className="p-3">
                      <p className="font-medium text-foreground text-xs">{period.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
                      </p>
                    </td>
                    {days.map((_, dayIdx) => {
                      const slot = timetable[dayIdx + 1]?.[period.id];
                      if (!slot) {
                        return (
                          <td key={dayIdx} className="p-3">
                            <div className="h-16 rounded-lg border border-dashed border-border/50 bg-muted/20" />
                          </td>
                        );
                      }
                      return (
                        <td key={dayIdx} className="p-3">
                          <div className="h-16 rounded-lg border border-primary/20 bg-primary/5 p-2">
                            <p className="text-xs font-semibold text-primary">
                              {(slot.subjects as any)?.name ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {(slot.classes as any)?.grades?.name ?? ""} {(slot.classes as any)?.name ?? ""}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {(slot.rooms as any)?.name ?? "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No timetable configured. Ask your admin to set up the timetable.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden space-y-4">
        {days.map((day, dayIdx) => {
          const daySlots = allPeriods
            ?.map((p) => ({ period: p, slot: timetable[dayIdx + 1]?.[p.id] }))
            .filter((item) => item.slot);
          return (
            <div key={day} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">{day}</h3>
              <div className="space-y-2">
                {daySlots && daySlots.length > 0 ? (
                  daySlots.map(({ period, slot }) => (
                    <div key={period.id} className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {(slot.subjects as any)?.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(slot.classes as any)?.grades?.name ?? ""} {(slot.classes as any)?.name ?? ""} · {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)} · {(slot.rooms as any)?.name ?? "—"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No classes scheduled</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
