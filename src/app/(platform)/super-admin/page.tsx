"use client";

import {
  AlertTriangle,
  AlertCircle,
  Clock,
  School,
  Users,
  GraduationCap,
  CreditCard,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useSchoolContext } from "@/components/platform/school-context";

const attentionItems = [
  {
    type: "critical" as const,
    icon: AlertTriangle,
    title: "2 critical system issues",
    description: "Database replication lag detected",
    color: "text-red-600 bg-red-50 border-red-200",
  },
  {
    type: "high" as const,
    icon: AlertCircle,
    title: "3 schools require attention",
    description: "Subscription or onboarding issues",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    type: "medium" as const,
    icon: Clock,
    title: "1 subscription expires in 5 days",
    description: "Green Valley Academy — renewal needed",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
];

const schoolsNeedingAttention = [
  { name: "Green Valley Academy", issue: "Subscription expiring", priority: "High" },
  { name: "St Mary's School", issue: "User limit approaching", priority: "Medium" },
  { name: "Hillcrest International", issue: "Onboarding incomplete", priority: "Low" },
];

const platformStats = [
  { label: "Schools", value: "48", icon: School },
  { label: "Users", value: "1,284", icon: Users },
  { label: "Students", value: "18,642", icon: GraduationCap },
  { label: "Subscriptions", value: "43", icon: CreditCard },
];

const systemHealth = [
  { label: "API", status: "Operational" },
  { label: "Database", status: "Operational" },
  { label: "Authentication", status: "Operational" },
  { label: "Sync", status: "Operational" },
];

export default function SuperAdminPage() {
  const { schools, currentSchool, setCurrentSchool, loading } = useSchoolContext();

  return (
    <div className="space-y-6">
      {/* Greeting + School Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good morning, Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what needs your attention.
          </p>
        </div>

        {/* School Context Switcher */}
        {schools.length > 0 && (
          <div className="relative">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Viewing school
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <School className="h-4 w-4 text-primary shrink-0" />
              <select
                value={currentSchool?.id ?? ""}
                onChange={(e) => {
                  const school = schools.find((s) => s.id === e.target.value);
                  if (school) setCurrentSchool(school);
                }}
                disabled={loading}
                className="bg-transparent text-sm font-medium text-foreground focus:outline-none appearance-none pr-6 cursor-pointer"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-muted-foreground -ml-4 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Needs Attention */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Needs Your Attention
        </h2>
        <div className="space-y-3">
          {attentionItems.map((item) => (
            <div
              key={item.title}
              className={`flex items-center gap-3 rounded-lg border p-3 ${item.color}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs opacity-80">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schools Needing Attention */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Schools Needing Attention
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">School</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Issue</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Priority</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {schoolsNeedingAttention.map((school) => (
                <tr key={school.name} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium text-foreground">{school.name}</td>
                  <td className="py-3 text-muted-foreground">{school.issue}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        school.priority === "High"
                          ? "bg-red-50 text-red-700"
                          : school.priority === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {school.priority}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-sm font-medium text-primary hover:underline">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Overview */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          System Health
        </h2>
        <div className="space-y-3">
          {systemHealth.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
