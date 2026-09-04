import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { Clock, MapPin } from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";

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
    .select(
      `
      id, day_of_week, period_id, class_id, subject_id, room_id,
      periods(name, start_time, end_time),
      classes(name, grades(name)),
      subjects(name),
      rooms(name)
    `
    )
    .eq("school_id", schoolId)
    .eq(
      "staff_id",
      staffRecord?.id ?? "00000000-0000-0000-0000-000000000000"
    );

  const { data: allPeriods } = await supabase
    .from("periods")
    .select("id, name, start_time, end_time, position")
    .eq("school_id", schoolId)
    .order("position");

  const { data: subjectColors } = await supabase
    .from("subject_colors")
    .select("subject_id, color")
    .eq("school_id", schoolId);

  const colorMap: Record<string, string> = {};
  subjectColors?.forEach((sc) => {
    colorMap[sc.subject_id] = sc.color;
  });

  const timetable: Record<number, Record<number, any>> = {};
  slots?.forEach((slot) => {
    if (!timetable[slot.day_of_week]) timetable[slot.day_of_week] = {};
    timetable[slot.day_of_week][slot.period_id] = slot;
  });

  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const currentDayIndex = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const isCurrentPeriod = (period: any) => {
    const start = period.start_time?.slice(0, 5);
    const end = period.end_time?.slice(0, 5);
    if (!start || !end) return false;
    return currentTime >= start && currentTime < end;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground mt-1">
            Your weekly teaching schedule
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left font-medium text-muted-foreground w-32">
                  Period
                </th>
                {days.map((day, idx) => (
                  <th
                    key={day}
                    className={`p-3 text-left font-medium text-muted-foreground ${
                      idx + 1 === currentDayIndex
                        ? "border-b-2 border-blue-500 bg-blue-500/5"
                        : ""
                    }`}
                  >
                    {day}
                    {idx + 1 === currentDayIndex && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                        TODAY
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPeriods && allPeriods.length > 0 ? (
                allPeriods.map((period) => {
                  const nowPeriod = isCurrentPeriod(period);
                  return (
                    <tr
                      key={period.id}
                      className={`border-b border-border/50 last:border-0 ${
                        nowPeriod ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-xs">
                            {period.name}
                          </p>
                          {nowPeriod && (
                            <span className="inline-flex items-center rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
                              NOW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {period.start_time?.slice(0, 5)} -{" "}
                          {period.end_time?.slice(0, 5)}
                        </p>
                      </td>
                      {days.map((_, dayIdx) => {
                        const slot = timetable[dayIdx + 1]?.[period.id];
                        const subjectId = slot?.subject_id;
                        const bgColor = subjectId
                          ? colorMap[subjectId] || "#3b82f6"
                          : null;
                        const bgTint = bgColor ? `${bgColor}15` : undefined;
                        const borderColor = bgColor
                          ? `${bgColor}40`
                          : undefined;

                        if (!slot) {
                          return (
                            <td
                              key={dayIdx}
                              className={`p-3 ${
                                dayIdx + 1 === currentDayIndex
                                  ? "bg-blue-500/5"
                                  : ""
                              }`}
                            >
                              <div className="h-16 rounded-lg border border-dashed border-border/50 bg-muted/20" />
                            </td>
                          );
                        }
                        return (
                          <td
                            key={dayIdx}
                            className={`p-3 ${
                              dayIdx + 1 === currentDayIndex
                                ? "bg-blue-500/5"
                                : ""
                            }`}
                          >
                            <div
                              className="h-16 rounded-lg border p-2"
                              style={{
                                backgroundColor: bgTint,
                                borderColor: borderColor,
                              }}
                            >
                              <p
                                className="text-xs font-semibold"
                                style={{ color: bgColor || undefined }}
                              >
                                {(slot.subjects as any)?.name ?? "—"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {(slot.classes as any)?.grades?.name ?? ""}{" "}
                                {(slot.classes as any)?.name ?? ""}
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
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No timetable configured. Ask your admin to set up the
                    timetable.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden space-y-4">
        {[...days.entries()]
          .sort(([a], [b]) => {
            if (a + 1 === currentDayIndex) return -1;
            if (b + 1 === currentDayIndex) return 1;
            return a - b;
          })
          .map(([idx, day]) => {
            const dayIdx = idx + 1;
            const isToday = dayIdx === currentDayIndex;
            const daySlots = allPeriods
              ?.map((p) => ({
                period: p,
                slot: timetable[dayIdx]?.[p.id],
                isNow: isCurrentPeriod(p) && isToday,
              }))
              .filter((item) => item.slot);
            return (
              <div
                key={day}
                className={`rounded-xl border bg-card p-4 ${
                  isToday
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-border"
                }`}
              >
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  {day}
                  {isToday && (
                    <span className="inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                      TODAY
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {daySlots && daySlots.length > 0 ? (
                    daySlots.map(({ period, slot, isNow }) => {
                      const subjectId = slot?.subject_id;
                      const bgColor = subjectId
                        ? colorMap[subjectId] || "#3b82f6"
                        : null;
                      const bgTint = bgColor ? `${bgColor}15` : undefined;
                      const borderColor = bgColor
                        ? `${bgColor}40`
                        : undefined;

                      return (
                        <div
                          key={period.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 ${
                            isNow ? "ring-2 ring-green-500/30" : ""
                          }`}
                          style={{
                            backgroundColor: bgTint,
                            borderColor: borderColor,
                          }}
                        >
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: bgColor
                                ? `${bgColor}20`
                                : undefined,
                            }}
                          >
                            <Clock
                              className="h-4 w-4"
                              style={{ color: bgColor || undefined }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p
                                className="text-sm font-medium"
                                style={{ color: bgColor || undefined }}
                              >
                                {(slot.subjects as any)?.name ?? "—"}
                              </p>
                              {isNow && (
                                <span className="inline-flex items-center rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
                                  NOW
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {(slot.classes as any)?.grades?.name ?? ""}{" "}
                              {(slot.classes as any)?.name ?? ""} ·{" "}
                              {period.start_time?.slice(0, 5)} -{" "}
                              {period.end_time?.slice(0, 5)} ·{" "}
                              {(slot.rooms as any)?.name ?? "—"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No classes scheduled
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .lg\\:block,
          .lg\\:block * {
            visibility: visible;
          }
          .lg\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .lg\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
