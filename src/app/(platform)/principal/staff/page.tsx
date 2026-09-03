import { Search, Plus, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

const roleColors: Record<string, string> = {
  teacher: "bg-blue-50 text-blue-700",
  secretary: "bg-purple-50 text-purple-700",
  finance: "bg-amber-50 text-amber-700",
  principal: "bg-green-50 text-green-700",
  admissions_officer: "bg-cyan-50 text-cyan-700",
};

export default async function PrincipalStaffPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, first_name, last_name, employee_number, role, department, is_active, user_id, profiles(full_name)")
    .eq("school_id", schoolId)
    .order("last_name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground mt-1">{staff?.length ?? 0} members</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Invite Staff</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search staff..." className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff && staff.length > 0 ? (
          staff.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {s.first_name[0]}{s.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {s.first_name} {s.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.department ?? "No department"}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[s.role] ?? "bg-gray-100 text-gray-600"}`}>
                  {s.role.replace(/_/g, " ")}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Phone className="h-3 w-3" />Contact
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Mail className="h-3 w-3" />Email
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No staff members found. Invite your first staff member to get started.
          </div>
        )}
      </div>
    </div>
  );
}
