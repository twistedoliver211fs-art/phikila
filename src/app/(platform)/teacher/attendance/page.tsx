import {
  CheckCircle,
  XCircle,
  Clock,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const students = [
  { id: "1", name: "Amara Okafor", status: "present" },
  { id: "2", name: "Liam Petrov", status: "present" },
  { id: "3", name: "Sofia Reyes", status: "absent" },
  { id: "4", name: "Chen Wei", status: "late" },
  { id: "5", name: "Fatima Al-Hassan", status: "present" },
  { id: "6", name: "James Oduya", status: "present" },
  { id: "7", name: "Priya Sharma", status: "absent" },
  { id: "8", name: "David Kimani", status: "present" },
];

const statusConfig = {
  present: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  absent: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  late: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
};

export default function AttendancePage() {
  const present = students.filter((s) => s.status === "present").length;
  const absent = students.filter((s) => s.status === "absent").length;
  const late = students.filter((s) => s.status === "late").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Grade 8A — Mathematics
          </p>
        </div>
        <Button size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save Attendance
        </Button>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Wednesday, September 3, 2026
          </p>
          <p className="text-xs text-muted-foreground">Period 3 — 10:00 AM</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{present}</p>
          <p className="text-xs font-medium text-green-600">Present</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{absent}</p>
          <p className="text-xs font-medium text-red-600">Absent</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{late}</p>
          <p className="text-xs font-medium text-amber-600">Late</p>
        </div>
      </div>

      {/* Student list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 p-4 border-b border-border bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Student
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Status
          </span>
        </div>
        {students.map((student) => {
          const config = statusConfig[student.status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div
              key={student.id}
              className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xs font-bold text-primary">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {student.name}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.color} ${config.border} border`}>
                <Icon className="h-3.5 w-3.5" />
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
