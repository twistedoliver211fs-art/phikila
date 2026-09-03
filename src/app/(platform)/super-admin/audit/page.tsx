"use client";

import { useState } from "react";
import {
  FileText,
  User,
  School,
  Settings,
  Shield,
  LogIn,
  LogOut,
  Filter,
} from "lucide-react";

const auditLogs = [
  {
    id: "1",
    action: "user.login",
    actor: "kipkiruigideon890@gmail.com",
    target: "Phikila Platform",
    details: "Google OAuth sign-in",
    timestamp: "2026-09-03T10:32:00Z",
    ip: "41.89.64.12",
  },
  {
    id: "2",
    action: "school.created",
    actor: "system",
    target: "Phikila Platform",
    details: "School registered via onboarding",
    timestamp: "2026-09-03T10:28:00Z",
    ip: "—",
  },
  {
    id: "3",
    action: "settings.updated",
    actor: "kipkiruigideon890@gmail.com",
    target: "Phikila Platform",
    details: "Updated school profile settings",
    timestamp: "2026-09-03T10:30:00Z",
    ip: "41.89.64.12",
  },
  {
    id: "4",
    action: "member.invited",
    actor: "kipkiruigideon890@gmail.com",
    target: "Phikila Platform",
    details: "Invited staff member as teacher",
    timestamp: "2026-09-03T10:35:00Z",
    ip: "41.89.64.12",
  },
  {
    id: "5",
    action: "auth.password_changed",
    actor: "system",
    target: "System",
    details: "Auth configuration updated",
    timestamp: "2026-09-03T10:20:00Z",
    ip: "—",
  },
];

const actionIcons: Record<string, typeof User> = {
  "user.login": LogIn,
  "user.logout": LogOut,
  "school.created": School,
  "settings.updated": Settings,
  "member.invited": User,
  "auth.password_changed": Shield,
};

const actionLabels: Record<string, string> = {
  "user.login": "User Login",
  "user.logout": "User Logout",
  "school.created": "School Created",
  "settings.updated": "Settings Updated",
  "member.invited": "Member Invited",
  "auth.password_changed": "Auth Updated",
};

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

export default function AuditLogPage() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? auditLogs
      : auditLogs.filter((l) => l.action.startsWith(filter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground mt-1">
            Track all system and user activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Events</option>
            <option value="user">User Events</option>
            <option value="school">School Events</option>
            <option value="settings">Settings Events</option>
            <option value="auth">Auth Events</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                  Target
                </th>
                <th className="p-4 text-left font-medium text-muted-foreground">
                  Details
                </th>
                <th className="p-4 text-left font-medium text-muted-foreground">
                  Time
                </th>
                <th className="p-4 text-left font-medium text-muted-foreground">
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const Icon = actionIcons[log.action] ?? FileText;
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
                          {actionLabels[log.action] ?? log.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{log.actor}</td>
                    <td className="p-4 text-muted-foreground">{log.target}</td>
                    <td className="p-4 text-muted-foreground">{log.details}</td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">
                      {log.ip}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No audit logs found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
