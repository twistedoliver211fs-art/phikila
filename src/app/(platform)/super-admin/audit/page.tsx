"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  User,
  School,
  Settings,
  Shield,
  LogIn,
  LogOut,
  Filter,
  CreditCard,
  GraduationCap,
  ClipboardCheck,
  Megaphone,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AuditLog {
  id: string;
  action: string;
  actor_email: string | null;
  actor_user_id: string | null;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

const actionIcons: Record<string, typeof User> = {
  "user.login": LogIn,
  "user.logout": LogOut,
  "school.created": School,
  "school.updated": School,
  "settings.updated": Settings,
  "member.invited": User,
  "member.removed": User,
  "auth.password_changed": Shield,
  "student.created": GraduationCap,
  "student.updated": GraduationCap,
  "student.deleted": GraduationCap,
  "staff.created": User,
  "staff.updated": User,
  "staff.deleted": User,
  "attendance.created": ClipboardCheck,
  "attendance.updated": ClipboardCheck,
  "admission.created": GraduationCap,
  "admission.approved": GraduationCap,
  "admission.rejected": GraduationCap,
  "announcement.created": Megaphone,
  "payment.created": DollarSign,
  "payment.received": DollarSign,
  "subscription.created": CreditCard,
  "subscription.activated": CreditCard,
  "subscription.cancelled": CreditCard,
  "subscription.upgraded": CreditCard,
  "subscription.downgraded": CreditCard,
  "role.assigned": Shield,
  "role.removed": Shield,
};

const categoryFilters = [
  { value: "all", label: "All Events" },
  { value: "user", label: "User Events" },
  { value: "school", label: "School Events" },
  { value: "student", label: "Student Events" },
  { value: "staff", label: "Staff Events" },
  { value: "admission", label: "Admission Events" },
  { value: "payment", label: "Payment Events" },
  { value: "subscription", label: "Subscription Events" },
  { value: "settings", label: "Settings Events" },
];

function formatAction(action: string): string {
  return action
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).replace(/_/g, " "))
    .join(" › ");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(iso).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchLogs() {
    try {
      const supabase = createClient();
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data, error } = await query;
      if (!error && data) {
        setLogs(data as AuditLog[]);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchLogs();
  }

  const filtered =
    filter === "all"
      ? logs
      : logs.filter((l) => l.action.startsWith(filter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground mt-1">
            Track all system and user activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {categoryFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading audit logs...
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Event
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Actor
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Resource
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Details
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const Icon = actionIcons[log.action] ?? FileText;
                  const meta = log.metadata as Record<string, string>;
                  const details = meta?.name
                    ? String(meta.name)
                    : meta?.plan
                      ? `Plan: ${String(meta.plan)}`
                      : meta?.immediate !== undefined
                        ? meta.immediate
                          ? "Immediate"
                          : "At period end"
                        : null;

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">
                            {formatAction(log.action)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {log.actor_email ?? "System"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {log.resource_type}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {details ?? "—"}
                      </td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        <span title={formatDate(log.created_at)}>
                          {timeAgo(log.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {logs.length === 0
              ? "No audit logs recorded yet."
              : "No audit logs match this filter."}
          </div>
        )}
      </div>
    </div>
  );
}
