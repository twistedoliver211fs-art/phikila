"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User } from "lucide-react";

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  periodId: string;
  periodName: string;
  startTime: string;
  endTime: string;
  position: number;
  subjectId: string;
  subjectName: string;
  roomName: string | null;
  teacherName: string | null;
  color: string | null;
}

interface Period {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  position: number;
}

interface ChildTimetable {
  studentId: string;
  firstName: string;
  lastName: string;
  className: string;
  gradeName: string;
  timetable: TimetableSlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ParentTimetablePage() {
  const [children, setChildren] = useState<ChildTimetable[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const res = await fetch("/api/parent/timetable");
        if (res.ok) {
          const data = await res.json();
          setChildren(data.children ?? []);
          setPeriods(data.periods ?? []);
          if (data.children?.length > 0) {
            setSelectedChild(data.children[0].studentId);
          }
        }
      } catch {
        console.error("Failed to fetch timetable");
      } finally {
        setLoading(false);
      }
    }
    fetchTimetable();
  }, []);

  const activeChild = children.find((c) => c.studentId === selectedChild);
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const currentDayIndex = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const timetableGrid: Record<number, Record<string, TimetableSlot>> = {};
  activeChild?.timetable.forEach((slot) => {
    if (!timetableGrid[slot.dayOfWeek]) timetableGrid[slot.dayOfWeek] = {};
    timetableGrid[slot.dayOfWeek][slot.periodId] = slot;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timetable</h1>
        <p className="text-muted-foreground">Weekly class schedule for your children</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No timetable data available</p>
            <p className="text-sm mt-2">Contact your school to set up timetables</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {children.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {children.map((child) => (
                <button
                  key={child.studentId}
                  onClick={() => setSelectedChild(child.studentId)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedChild === child.studentId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {child.firstName} {child.lastName}
                </button>
              ))}
            </div>
          )}

          {activeChild && (
            <>
              <p className="text-sm text-muted-foreground">
                {activeChild.gradeName} {activeChild.className}
              </p>

              <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-3 text-left font-medium text-muted-foreground w-32">
                          Period
                        </th>
                        {DAYS.map((day, idx) => (
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
                      {periods.length > 0 ? (
                        periods.map((period) => {
                          const isCurrentPeriod =
                            currentTime >= (period.start_time?.slice(0, 5) ?? "") &&
                            currentTime < (period.end_time?.slice(0, 5) ?? "");
                          return (
                            <tr
                              key={period.id}
                              className={`border-b border-border/50 last:border-0 ${
                                isCurrentPeriod ? "bg-blue-500/5" : ""
                              }`}
                            >
                              <td className="p-3">
                                <p className="font-medium text-foreground text-xs">
                                  {period.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
                                </p>
                              </td>
                              {DAYS.map((_, dayIdx) => {
                                const slot = timetableGrid[dayIdx + 1]?.[period.id];
                                if (!slot) {
                                  return (
                                    <td
                                      key={dayIdx}
                                      className={`p-3 ${dayIdx + 1 === currentDayIndex ? "bg-blue-500/5" : ""}`}
                                    >
                                      <div className="h-16 rounded-lg border border-dashed border-border/50 bg-muted/20" />
                                    </td>
                                  );
                                }
                                const bgColor = slot.color ?? "#3b82f6";
                                return (
                                  <td
                                    key={dayIdx}
                                    className={`p-3 ${dayIdx + 1 === currentDayIndex ? "bg-blue-500/5" : ""}`}
                                  >
                                    <div
                                      className="h-16 rounded-lg border p-2"
                                      style={{
                                        backgroundColor: `${bgColor}15`,
                                        borderColor: `${bgColor}40`,
                                      }}
                                    >
                                      <p className="text-xs font-semibold" style={{ color: bgColor }}>
                                        {slot.subjectName}
                                      </p>
                                      {slot.teacherName && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <User className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground truncate">
                                            {slot.teacherName}
                                          </span>
                                        </div>
                                      )}
                                      {slot.roomName && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <MapPin className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">
                                            {slot.roomName}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No timetable configured for this class
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:hidden space-y-4">
                {DAYS.map((day, idx) => {
                  const dayNum = idx + 1;
                  const isToday = dayNum === currentDayIndex;
                  const daySlots = periods
                    .map((p) => ({
                      period: p,
                      slot: timetableGrid[dayNum]?.[p.id],
                    }))
                    .filter((item) => item.slot);
                  return (
                    <div
                      key={day}
                      className={`rounded-xl border bg-card p-4 ${
                        isToday ? "border-blue-500 ring-2 ring-blue-500/20" : "border-border"
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
                        {daySlots.length > 0 ? (
                          daySlots.map(({ period, slot }) => {
                            const bgColor = slot!.color ?? "#3b82f6";
                            return (
                              <div
                                key={period.id}
                                className="flex items-center gap-3 rounded-lg border p-3"
                                style={{
                                  backgroundColor: `${bgColor}15`,
                                  borderColor: `${bgColor}40`,
                                }}
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium" style={{ color: bgColor }}>
                                    {slot!.subjectName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
                                    {slot!.teacherName && ` · ${slot!.teacherName}`}
                                    {slot!.roomName && ` · ${slot!.roomName}`}
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
            </>
          )}
        </>
      )}
    </div>
  );
}
