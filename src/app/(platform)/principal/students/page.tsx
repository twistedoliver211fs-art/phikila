import { Search, Plus, GraduationCap, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const students = [
  { id: "1", name: "Amara Okafor", grade: "8A", parent: "Mr. Okafor", phone: "+254 712 345 678", status: "Active" },
  { id: "2", name: "Liam Petrov", grade: "8A", parent: "Mrs. Petrov", phone: "+254 723 456 789", status: "Active" },
  { id: "3", name: "Sofia Reyes", grade: "7B", parent: "Mr. Reyes", phone: "+254 734 567 890", status: "Active" },
  { id: "4", name: "Chen Wei", grade: "7A", parent: "Mrs. Chen", phone: "+254 745 678 901", status: "Active" },
  { id: "5", name: "Fatima Al-Hassan", grade: "8A", parent: "Mr. Al-Hassan", phone: "+254 756 789 012", status: "Inactive" },
  { id: "6", name: "James Oduya", grade: "6A", parent: "Mrs. Oduya", phone: "+254 767 890 123", status: "Active" },
];

export default function PrincipalStudentsPage() {
  const active = students.filter((s) => s.status === "Active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">{students.length} total · {active} active</p>
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
                <th className="p-4 text-left font-medium text-muted-foreground">Grade</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Parent/Guardian</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Phone</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-bold text-primary">{s.name.split(" ").map((n) => n[0]).join("")}</span>
                      </div>
                      <span className="font-medium text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{s.grade}</td>
                  <td className="p-4 text-muted-foreground">{s.parent}</td>
                  <td className="p-4 text-muted-foreground">{s.phone}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
