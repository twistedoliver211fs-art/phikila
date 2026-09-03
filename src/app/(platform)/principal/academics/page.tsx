import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function PrincipalAcademicsPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: terms } = await supabase
    .from("terms")
    .select("id, name, is_current, start_date, end_date")
    .eq("is_current", true)
    .limit(1);

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, code")
    .eq("school_id", schoolId);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grades(name)")
    .eq("school_id", schoolId);

  const { data: students } = await supabase
    .from("students")
    .select("id, class_id")
    .eq("school_id", schoolId)
    .eq("is_active", true);

  const currentTerm = terms?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Academics</h1>
        <p className="text-muted-foreground mt-1">Academic structure overview</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Current Term</h2>
          {currentTerm && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Term</p>
            <p className="text-lg font-bold text-foreground mt-1">{currentTerm?.name ?? "No active term"}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Classes</p>
            <p className="text-lg font-bold text-foreground mt-1">{classes?.length ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Subjects</p>
            <p className="text-lg font-bold text-foreground mt-1">{subjects?.length ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Subjects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Subject</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Code</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Classes</th>
              </tr>
            </thead>
            <tbody>
              {subjects && subjects.length > 0 ? (
                subjects.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{s.name}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{s.code ?? "—"}</td>
                    <td className="p-4 text-muted-foreground">{classes?.length ?? 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No subjects configured. Add subjects to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Classes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Grade</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Students</th>
              </tr>
            </thead>
            <tbody>
              {classes && classes.length > 0 ? (
                classes.map((c) => {
                  const studentCount = students?.filter((s) => s.class_id === c.id).length ?? 0;
                  return (
                    <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{c.name}</td>
                      <td className="p-4 text-muted-foreground">{(c.grades as any)?.name ?? "—"}</td>
                      <td className="p-4 text-muted-foreground">{studentCount}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No classes found. Set up your classes first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
