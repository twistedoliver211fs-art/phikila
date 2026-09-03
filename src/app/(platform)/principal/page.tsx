import {
  AlertTriangle,
  Users,
  GraduationCap,
  DollarSign,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { NotificationCenter } from "@/components/platform/notification-center";

const attentionItems = [
  {
    icon: Users,
    title: "12 attendance concerns",
    description: "Students with 3+ absences this week",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    action: "View Attendance",
  },
  {
    icon: AlertTriangle,
    title: "2 staff members absent",
    description: "Coverage needed for today",
    color: "text-red-600 bg-red-50 border-red-200",
    action: "Review Staff",
  },
  {
    icon: DollarSign,
    title: "8 overdue fee accounts",
    description: "Payments past due date",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    action: "Review Fees",
  },
  {
    icon: UserCheck,
    title: "3 admissions pending",
    description: "Applications awaiting review",
    color: "text-green-600 bg-green-50 border-green-200",
    action: "Review Admissions",
  },
];

const todayOverview = [
  { label: "Student Attendance", value: "94%", color: "text-green-600" },
  { label: "Staff Attendance", value: "97%", color: "text-green-600" },
  { label: "Fee Collection", value: "82%", color: "text-amber-600" },
  { label: "Admissions Pending", value: "3", color: "text-blue-600" },
];

const performanceTrends = [
  { label: "Academic Performance", trend: "up", value: "+2.3%" },
  { label: "Attendance Rate", trend: "up", value: "+1.1%" },
  { label: "Fee Collection", trend: "down", value: "-0.8%" },
  { label: "Enrollment Growth", trend: "up", value: "+5.2%" },
];

export default function PrincipalPage() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good morning</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what needs attention at your school.
        </p>
      </div>

      {/* Needs Attention */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Needs Your Attention
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attentionItems.map((item) => (
            <div
              key={item.title}
              className={`flex items-start gap-3 rounded-lg border p-4 ${item.color}`}
            >
              <item.icon className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{item.description}</p>
                <button className="mt-2 text-xs font-semibold underline opacity-90 hover:opacity-100">
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's School Overview */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Today&apos;s School Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {todayOverview.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          School Performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceTrends.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <TrendingUp
                  className={`h-4 w-4 ${
                    item.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                />
                <span
                  className={`text-lg font-bold ${
                    item.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication */}
      <NotificationCenter />
    </div>
  );
}
