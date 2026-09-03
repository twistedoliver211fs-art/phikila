import { Search, Plus, Users, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const staff = [
  { id: "1", name: "John Mwangi", role: "Teacher", department: "Mathematics", phone: "+254 711 111 111", email: "mwangi@school.com", status: "Active" },
  { id: "2", name: "Grace Wambui", role: "Teacher", department: "English", phone: "+254 722 222 222", email: "wambui@school.com", status: "Active" },
  { id: "3", name: "Peter Ochieng", role: "Teacher", department: "Science", phone: "+254 733 333 333", email: "ochieng@school.com", status: "Active" },
  { id: "4", name: "Mary Njeri", role: "Secretary", department: "Administration", phone: "+254 744 444 444", email: "njeri@school.com", status: "Active" },
  { id: "5", name: "David Kipchoge", role: "Finance", department: "Finance", phone: "+254 755 555 555", email: "kipchoge@school.com", status: "Active" },
  { id: "6", name: "Sarah Akinyi", role: "Teacher", department: "Kiswahili", phone: "+254 766 666 666", email: "akinyi@school.com", status: "On Leave" },
];

const roleColors: Record<string, string> = {
  Teacher: "bg-blue-50 text-blue-700",
  Secretary: "bg-purple-50 text-purple-700",
  Finance: "bg-amber-50 text-amber-700",
};

export default function PrincipalStaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground mt-1">{staff.length} members</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Invite Staff</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search staff..." className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">{s.name.split(" ").map((n) => n[0]).join("")}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.department}</p>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[s.role] ?? "bg-gray-100 text-gray-600"}`}>
                {s.role}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                <Phone className="h-3 w-3" />Call
              </a>
              <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                <Mail className="h-3 w-3" />Email
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
