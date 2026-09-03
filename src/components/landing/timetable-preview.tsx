import { AlertTriangle, Sparkles } from "lucide-react";

export function TimetablePreview() {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const periods = [
    { time: "8:00", slots: ["Mathematics", "English", "Mathematics", "Science", "English"] },
    { time: "9:00", slots: ["Science", "Mathematics", "English", "Mathematics", "Science"] },
    { time: "10:00", slots: ["English", "Science", "Art", "Mathematics", "PE"] },
    { time: "11:00", slots: ["History", "Geography", "Science", "English", "Music"] },
  ];

  return (
    <section id="timetable" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Intelligent Scheduling
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Build better timetables. Automatically.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            AI-assisted scheduling that respects constraints, detects conflicts,
            and suggests optimal solutions.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Timetable Grid */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-20 px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider" />
                  {days.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period, pi) => (
                  <tr key={period.time} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                      {period.time}
                    </td>
                    {period.slots.map((subject, si) => {
                      const isConflict =
                        pi === 2 && si === 3;
                      return (
                        <td key={`${pi}-${si}`} className="px-2 py-2">
                          <div
                            className={`rounded-md px-3 py-2 text-center text-sm font-medium ${
                              isConflict
                                ? "bg-red-50 border border-red-200 text-red-700"
                                : "bg-primary/5 border border-primary/10 text-primary/80"
                            }`}
                          >
                            {subject}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Conflict / AI Callout */}
          <div className="border-t border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Scheduling conflict detected
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Mr. Kamau is assigned to two lessons at 10:00 on Thursday.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm text-primary/80">
                    <span className="font-semibold text-primary">AI suggestion:</span>{" "}
                    Move Grade 9B Mathematics to Tuesday 11:00.
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    Review suggestion
                  </button>
                  <button className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    Fix manually
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
