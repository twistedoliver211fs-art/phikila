import {
  Baby,
  DollarSign,
  BookOpen,
  Calendar,
  Mail,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const children = [
  {
    name: "Jane Wanjiku",
    grade: "Grade 8A",
    attendance: "96%",
    academicStatus: "Good",
  },
  {
    name: "Sam Wanjiku",
    grade: "Grade 5B",
    attendance: "92%",
    academicStatus: "Excellent",
  },
];

const attentionItems = [
  {
    icon: DollarSign,
    title: "Fee balance available",
    description: "KES 12,500 remaining for Jane",
    action: "View Fees",
    href: "/platform/parent",
  },
];

const recentUpdates = [
  {
    icon: BookOpen,
    title: "Academic result posted",
    description: "Jane — End of term exam results",
    time: "2 days ago",
  },
  {
    icon: AlertCircle,
    title: "School announcement",
    description: "Mid-term break dates confirmed",
    time: "3 days ago",
  },
];

const quickAccess = [
  { label: "Attendance", href: "/platform/parent", icon: Calendar },
  { label: "Fees", href: "/platform/parent", icon: DollarSign },
  { label: "Academics", href: "/platform/parent", icon: BookOpen },
  { label: "Timetable", href: "/platform/parent", icon: Calendar },
  { label: "Messages", href: "/platform/parent", icon: Mail },
];

export default function ParentPage() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hello, Parent</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your children.
        </p>
      </div>

      {/* Children */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Baby className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            My Children
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <div
              key={child.name}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">
                    {child.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {child.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{child.grade}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                  <p className="text-sm font-semibold text-foreground">
                    {child.attendance}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Academic Status
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {child.academicStatus}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attention */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Attention
        </h2>
        <div className="space-y-3">
          {attentionItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
            >
              <item.icon className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  {item.title}
                </p>
                <p className="text-xs text-amber-700">{item.description}</p>
              </div>
              <Link
                href={item.href}
                className="text-xs font-semibold text-amber-800 underline hover:no-underline"
              >
                {item.action}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Updates */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Recent Updates
        </h2>
        <div className="space-y-3">
          {recentUpdates.map((update) => (
            <div
              key={update.title}
              className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
            >
              <update.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {update.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {update.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {update.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickAccess.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 hover:shadow-md transition-all"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
