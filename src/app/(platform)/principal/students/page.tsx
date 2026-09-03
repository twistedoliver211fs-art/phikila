import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function PrincipalStudentsPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, admission_number, gender, is_active, class_id, classes(name, grades(name))")
    .eq("school_id", schoolId)
    .order("last_name");

  const total = students?.length ?? 0;
  const active = students?.filter((s) => s.is_active).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">{total} total · {active} active</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Student</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search students..." className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Student</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Adm No.</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Gender</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students && students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-bold text-primary">
                            {s.first_name[0]}{s.last_name[0]}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {s.first_name} {s.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{s.admission_number}</td>
                    <td className="p-4 text-muted-foreground">
                      {(s.classes as any)?.grades?.name ?? "—"} {(s.classes as any)?.name ?? ""}
                    </td>
                    <td className="p-4 text-muted-foreground capitalize">{s.gender ?? "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No students found. Add your first student to get started.
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
