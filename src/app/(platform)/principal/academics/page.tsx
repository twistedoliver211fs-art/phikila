import { BookOpen, BarChart3, Users } from "lucide-react";

const terms = [
  { name: "Term 1, 2026", status: "Completed", avgScore: 72 },
  { name: "Term 2, 2026", status: "Active", avgScore: null },
];

const classes = [
  { name: "Grade 8A", subject: "Mathematics", teacher: "John Mwangi", avgScore: 78, students: 32 },
  { name: "Grade 8B", subject: "Mathematics", teacher: "John Mwangi", avgScore: 71, students: 32 },
  { name: "Grade 7A", subject: "Science", teacher: "Peter Ochieng", avgScore: 74, students: 32 },
  { name: "Grade 7B", subject: "English", teacher: "Grace Wambui", avgScore: 69, students: 32 },
  { name: "Grade 6A", subject: "Kiswahili", teacher: "Sarah Akinyi", avgScore: 76, students: 32 },
];

const subjects = [
  { name: "Mathematics", classes: 6, avgScore: 74 },
  { name: "English", classes: 6, avgScore: 71 },
  { name: "Kiswahili", classes: 6, avgScore: 73 },
  { name: "Science", classes: 6, avgScore: 72 },
  { name: "Social Studies", classes: 6, avgScore: 70 },
];

export default function PrincipalAcademicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Academics</h1>
        <p className="text-muted-foreground mt-1">Academic performance overview</p>
      </div>

      {/* Current Term */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Current Term</h2>
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Term</p>
            <p className="text-lg font-bold text-foreground mt-1">Term 2, 2026</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">School Average</p>
            <p className="text-lg font-bold text-foreground mt-1">—</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Classes</p>
            <p className="text-lg font-bold text-foreground mt-1">6</p>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Subject Performance (Term 1)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Subject</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Classes</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Avg Score</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Performance</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.name} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{s.name}</td>
                  <td className="p-4 text-muted-foreground">{s.classes}</td>
                  <td className="p-4 font-medium text-foreground">{s.avgScore}%</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${s.avgScore >= 75 ? "bg-green-500" : s.avgScore >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.avgScore}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Performance */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Class Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Subject</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Teacher</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Students</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{c.name}</td>
                  <td className="p-4 text-muted-foreground">{c.subject}</td>
                  <td className="p-4 text-muted-foreground">{c.teacher}</td>
                  <td className="p-4 text-muted-foreground">{c.students}</td>
                  <td className="p-4 font-medium text-foreground">{c.avgScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
