"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";

interface PlatformStats {
  schools: number;
  users: number;
  students: number;
  subscriptions: number;
}

export default function SuperAdminPage() {
  const { schools, currentSchool, setCurrentSchool, loading: schoolLoading } = useSchoolContext();
  const [stats, setStats] = useState<PlatformStats>({ schools: 0, users: 0, students: 0, subscriptions: 0 });
  const [recentSchools, setRecentSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchStats() {
      const [schoolsRes, usersRes, studentsRes, subsRes] = await Promise.all([
        supabase.from("schools").select("id", { count: "exact", head: true }),
        supabase.from("school_members").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("schools").select("id", { count: "exact", head: true }).eq("subscription_status", "active"),
      ]);

      setStats({
        schools: schoolsRes.count ?? 0,
        users: usersRes.count ?? 0,
        students: studentsRes.count ?? 0,
        subscriptions: subsRes.count ?? 0,
      });

      const { data: recent } = await supabase
        .from("schools")
        .select("id, name, status, subscription_status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentSchools(recent ?? []);
      setLoading(false);
    }

    fetchStats();
  }, []);

  const platformStats = [
    { label: "Schools", value: stats.schools, icon: School },
    { label: "Users", value: stats.users, icon: Users },
    { label: "Students", value: stats.students, icon: GraduationCap },
    { label: "Subscriptions", value: stats.subscriptions, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Admin</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your platform overview.</p>
        </div>

        {schools.length > 0 && (
          <div className="relative">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Viewing school</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <School className="h-4 w-4 text-primary shrink-0" />
              <select
                value={currentSchool?.id ?? ""}
                onChange={(e) => {
                  const school = schools.find((s) => s.id === e.target.value);
                  if (school) setCurrentSchool(school);
                }}
                disabled={schoolLoading}
                className="bg-transparent text-sm font-medium text-foreground focus:outline-none appearance-none pr-6 cursor-pointer"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-muted-foreground -ml-4 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Platform Overview */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Schools */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Recent Schools</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">School</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Subscription</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : recentSchools.length > 0 ? (
                recentSchools.map((school) => (
                  <tr key={school.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{school.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        school.status === "active" ? "bg-green-50 text-green-700" :
                        school.status === "pending" ? "bg-amber-50 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        school.subscription_status === "active" ? "bg-green-50 text-green-700" :
                        school.subscription_status === "trial" ? "bg-blue-50 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {school.subscription_status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(school.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No schools yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">System Health</h2>
        <div className="space-y-3">
          {["API", "Database", "Authentication", "Sync"].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item}</span>
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                Operational
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
