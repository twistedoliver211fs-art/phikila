import { Clock, MapPin } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const periods = [
  { time: "8:00 - 8:40", label: "Period 1" },
  { time: "8:45 - 9:25", label: "Period 2" },
  { time: "9:30 - 10:10", label: "Period 3" },
  { time: "10:30 - 11:10", label: "Period 4" },
  { time: "11:15 - 11:55", label: "Period 5" },
  { time: "12:00 - 12:40", label: "Period 6" },
  { time: "1:30 - 2:10", label: "Period 7" },
  { time: "2:15 - 2:55", label: "Period 8" },
];

const timetable: Record<string, Record<number, { subject: string; class: string; room: string } | null>> = {
  Monday: {
    1: { subject: "Mathematics", class: "8A", room: "Room 12" },
    2: { subject: "Mathematics", class: "8A", room: "Room 12" },
    3: null,
    4: { subject: "Mathematics", class: "7B", room: "Room 12" },
    5: { subject: "Mathematics", class: "7B", room: "Room 12" },
    6: null,
    7: { subject: "Mathematics", class: "8A", room: "Room 12" },
    8: null,
  },
  Tuesday: {
    1: { subject: "Mathematics", class: "7A", room: "Room 12" },
    2: null,
    3: { subject: "Mathematics", class: "8A", room: "Room 12" },
    4: { subject: "Mathematics", class: "8A", room: "Room 12" },
    5: null,
    6: { subject: "Mathematics", class: "7B", room: "Room 12" },
    7: { subject: "Mathematics", class: "7B", room: "Room 12" },
    8: null,
  },
  Wednesday: {
    1: null,
    2: { subject: "Mathematics", class: "8A", room: "Room 12" },
    3: { subject: "Mathematics", class: "8A", room: "Room 12" },
    4: null,
    5: { subject: "Mathematics", class: "7A", room: "Room 12" },
    6: { subject: "Mathematics", class: "7A", room: "Room 12" },
    7: null,
    8: null,
  },
  Thursday: {
    1: { subject: "Mathematics", class: "8A", room: "Room 12" },
    2: { subject: "Mathematics", class: "8A", room: "Room 12" },
    3: null,
    4: { subject: "Mathematics", class: "7A", room: "Room 12" },
    5: { subject: "Mathematics", class: "7A", room: "Room 12" },
    6: null,
    7: { subject: "Mathematics", class: "8A", room: "Room 12" },
    8: { subject: "Mathematics", class: "8A", room: "Room 12" },
  },
  Friday: {
    1: null,
    2: { subject: "Mathematics", class: "7B", room: "Room 12" },
    3: { subject: "Mathematics", class: "7B", room: "Room 12" },
    4: { subject: "Mathematics", class: "8A", room: "Room 12" },
    5: null,
    6: null,
    7: null,
    8: null,
  },
};

export default function TimetablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
        <p className="text-muted-foreground mt-1">
          Your weekly teaching schedule
        </p>
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
                {days.map((day) => (
                  <th
                    key={day}
                    className="p-3 text-left font-medium text-muted-foreground"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0">
                  <td className="p-3">
                    <p className="font-medium text-foreground text-xs">{period.label}</p>
                    <p className="text-xs text-muted-foreground">{period.time}</p>
                  </td>
                  {days.map((day) => {
                    const slot = timetable[day]?.[idx + 1];
                    if (!slot) {
                      return (
                        <td key={day} className="p-3">
                          <div className="h-16 rounded-lg border border-dashed border-border/50 bg-muted/20" />
                        </td>
                      );
                    }
                    return (
                      <td key={day} className="p-3">
                        <div className="h-16 rounded-lg border border-primary/20 bg-primary/5 p-2">
                          <p className="text-xs font-semibold text-primary">{slot.subject}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{slot.class}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{slot.room}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden space-y-4">
        {days.map((day) => (
          <div key={day} className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{day}</h3>
            <div className="space-y-2">
              {periods.map((period, idx) => {
                const slot = timetable[day]?.[idx + 1];
                if (!slot) return null;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{slot.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.class} · {period.time} · {slot.room}
                      </p>
                    </div>
                  </div>
                );
              })}
              {periods.every((_, idx) => !timetable[day]?.[idx + 1]) && (
                <p className="text-sm text-muted-foreground text-center py-4">No classes scheduled</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
