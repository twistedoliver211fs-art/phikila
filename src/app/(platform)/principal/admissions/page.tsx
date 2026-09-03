import { UserPlus, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const applications = [
  { id: "1", name: "Zara Mohamed", grade: "Applying for: Grade 8A", date: "Sep 1, 2026", status: "pending", parent: "Mr. Mohamed" },
  { id: "2", name: "Ethan Brooks", grade: "Applying for: Grade 7A", date: "Aug 30, 2026", status: "approved", parent: "Mrs. Brooks" },
  { id: "3", name: "Aisha Osman", grade: "Applying for: Grade 6A", date: "Aug 28, 2026", status: "pending", parent: "Mr. Osman" },
  { id: "4", name: "Noah Fischer", grade: "Applying for: Grade 8B", date: "Aug 25, 2026", status: "rejected", parent: "Mrs. Fischer" },
  { id: "5", name: "Luna Kim", grade: "Applying for: Grade 7B", date: "Aug 22, 2026", status: "approved", parent: "Mr. Kim" },
];

const stats = [
  { label: "Total Applications", value: "12", color: "text-foreground" },
  { label: "Pending Review", value: "5", color: "text-amber-600" },
  { label: "Approved", value: "5", color: "text-green-600" },
  { label: "Rejected", value: "2", color: "text-red-600" },
];

const statusConfig = {
  pending: { icon: Clock, color: "bg-amber-50 text-amber-700", label: "Pending" },
  approved: { icon: CheckCircle, color: "bg-green-50 text-green-700", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-50 text-red-700", label: "Rejected" },
};

export default function PrincipalAdmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admissions</h1>
        <p className="text-muted-foreground mt-1">Manage student applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Applications */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Student</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Grade</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Parent</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const config = statusConfig[app.status as keyof typeof statusConfig];
                const Icon = config.icon;
                return (
                  <tr key={app.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-bold text-primary">{app.name.split(" ").map((n) => n[0]).join("")}</span>
                        </div>
                        <span className="font-medium text-foreground">{app.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{app.grade}</td>
                    <td className="p-4 text-muted-foreground">{app.parent}</td>
                    <td className="p-4 text-muted-foreground">{app.date}</td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
