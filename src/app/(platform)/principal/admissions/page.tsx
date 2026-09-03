import { Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-amber-50 text-amber-700", label: "Pending" },
  under_review: { icon: Clock, color: "bg-blue-50 text-blue-700", label: "Under Review" },
  accepted: { icon: CheckCircle, color: "bg-green-50 text-green-700", label: "Accepted" },
  rejected: { icon: XCircle, color: "bg-red-50 text-red-700", label: "Rejected" },
  enrolled: { icon: CheckCircle, color: "bg-green-50 text-green-700", label: "Enrolled" },
};

export default async function PrincipalAdmissionsPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("admissions")
    .select("id, applicant_name, applicant_email, applicant_phone, status, created_at, requested_class_id, classes(name, grades(name))")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  const total = applications?.length ?? 0;
  const pending = applications?.filter((a) => a.status === "pending" || a.status === "under_review").length ?? 0;
  const accepted = applications?.filter((a) => a.status === "accepted" || a.status === "enrolled").length ?? 0;
  const rejected = applications?.filter((a) => a.status === "rejected").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admissions</h1>
        <p className="text-muted-foreground mt-1">Manage student applications</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Applications</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Accepted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{accepted}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{rejected}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Applicant</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Requested Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications && applications.length > 0 ? (
                applications.map((app) => {
                  const config = statusConfig[app.status] ?? statusConfig.pending;
                  const Icon = config.icon;
                  return (
                    <tr key={app.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-bold text-primary">
                              {app.applicant_name.split(" ").map((n: string) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{app.applicant_name}</span>
                            <p className="text-xs text-muted-foreground">{app.applicant_email ?? "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                      {(app.classes as any)?.grades?.name ?? ""} {(app.classes as any)?.name ?? ""}
                    </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No applications yet.
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
