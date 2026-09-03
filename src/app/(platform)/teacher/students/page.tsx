import { Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const students = [
  { id: "1", name: "Amara Okafor", grade: "8A", parent: "Mr. Okafor", phone: "+254 712 345 678", email: "okafor@email.com", gpa: "3.8" },
  { id: "2", name: "Liam Petrov", grade: "8A", parent: "Mrs. Petrov", phone: "+254 723 456 789", email: "petrov@email.com", gpa: "3.5" },
  { id: "3", name: "Sofia Reyes", grade: "8A", parent: "Mr. Reyes", phone: "+254 734 567 890", email: "reyes@email.com", gpa: "3.9" },
  { id: "4", name: "Chen Wei", grade: "8A", parent: "Mrs. Chen", phone: "+254 745 678 901", email: "chen@email.com", gpa: "3.7" },
  { id: "5", name: "Fatima Al-Hassan", grade: "8A", parent: "Mr. Al-Hassan", phone: "+254 756 789 012", email: "hassan@email.com", gpa: "3.6" },
  { id: "6", name: "James Oduya", grade: "8A", parent: "Mrs. Oduya", phone: "+254 767 890 123", email: "oduya@email.com", gpa: "3.4" },
  { id: "7", name: "Priya Sharma", grade: "8A", parent: "Mr. Sharma", phone: "+254 778 901 234", email: "sharma@email.com", gpa: "3.8" },
  { id: "8", name: "David Kimani", grade: "8A", parent: "Mrs. Kimani", phone: "+254 789 012 345", email: "kimani@email.com", gpa: "3.2" },
];

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">
          Grade 8A — 8 students enrolled
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Student cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">Grade {student.grade}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Parent/Guardian</p>
                <p className="font-medium text-foreground">{student.parent}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GPA</p>
                <p className="font-medium text-foreground">{student.gpa}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${student.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <Phone className="h-3 w-3" />
                Call
              </a>
              <a
                href={`mailto:${student.email}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <Mail className="h-3 w-3" />
                Email
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
