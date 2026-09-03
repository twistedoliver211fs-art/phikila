import {
  Clock,
  ClipboardCheck,
  BookOpen,
  Briefcase,
  Megaphone,
} from "lucide-react";

const todaySchedule = [
  { time: "08:00", subject: "Grade 8A Mathematics", room: "Room 12" },
  { time: "09:00", subject: "Grade 9B Mathematics", room: "Room 12" },
  { time: "11:00", subject: "Grade 8A Science", room: "Lab 3" },
];

const tasks = [
  {
    icon: ClipboardCheck,
    title: "Attendance pending",
    description: "Grade 8A — take attendance",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    icon: BookOpen,
    title: "Marks pending",
    description: "2 assessments need grading",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
];

export default function TeacherPage() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good morning, James
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your schedule for today.
        </p>
      </div>

      {/* Today's Schedule */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Today&apos;s Schedule
          </h2>
        </div>
        <div className="space-y-2">
          {todaySchedule.map((slot) => (
            <div
              key={`${slot.time}-${slot.subject}`}
              className="flex items-center gap-4 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-mono font-medium text-muted-foreground w-12">
                {slot.time}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {slot.subject}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{slot.room}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Tasks</h2>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.title}
              className={`flex items-center gap-3 rounded-lg border p-3 ${task.color}`}
            >
              <task.icon className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs opacity-80">{task.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            My Workload
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">22</span>
              <span className="text-sm text-muted-foreground">/ 24 lessons</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: "91.7%" }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">
              2 free capacity
            </p>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Announcements
          </h2>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-sm font-medium text-foreground">
              Staff meeting moved to Friday 3:00 PM
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From: Principal — 2 hours ago
            </p>
          </div>
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-sm font-medium text-foreground">
              Mid-term assessments due next week
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From: Academic Office — 1 day ago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
