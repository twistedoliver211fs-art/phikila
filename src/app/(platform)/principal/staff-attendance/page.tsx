"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/platform/toast";

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  attendance: {
    id: string;
    status: "present" | "absent" | "late" | "excused" | "on_leave";
    check_in_time: string | null;
    check_out_time: string | null;
    notes: string | null;
  } | null;
}

type Status = "present" | "absent" | "late" | "excused" | "on_leave";

const statusConfig: Record<Status, { label: string; className: string }> = {
  present: { label: "Present", className: "bg-green-100 text-green-700 border-green-200" },
  absent: { label: "Absent", className: "bg-red-100 text-red-700 border-red-200" },
  late: { label: "Late", className: "bg-amber-100 text-amber-700 border-amber-200" },
  excused: { label: "Excused", className: "bg-blue-100 text-blue-700 border-blue-200" },
  on_leave: { label: "On Leave", className: "bg-purple-100 text-purple-700 border-purple-200" },
};

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function PrincipalStaffAttendancePage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff-attendance?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff);
        const initial: Record<string, Status> = {};
        data.staff.forEach((s: StaffMember) => {
          initial[s.id] = s.attendance?.status ?? "present";
        });
        setStatuses(initial);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = (staffId: string, status: Status) => {
    setStatuses((prev) => ({ ...prev, [staffId]: status }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = staff.map((s) => ({
        staffId: s.id,
        status: statuses[s.id],
      }));

      const res = await fetch("/api/staff-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, records }),
      });

      if (res.ok) {
        toast("Staff attendance saved");
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(statuses).filter((s) => s === "present" || s === "late").length;
  const absentCount = Object.values(statuses).filter((s) => s === "absent").length;
  const excusedCount = Object.values(statuses).filter((s) => s === "excused").length;
  const totalCount = staff.length;
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Attendance</h1>
          <p className="text-muted-foreground mt-1">Record attendance for {selectedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent px-2 py-1 text-sm font-medium text-foreground focus:outline-none"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button onClick={saveAttendance} disabled={saving || staff.length === 0}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-green-600 uppercase tracking-wide">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-red-600 uppercase tracking-wide">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{attendanceRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Staff Members</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No active staff found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-medium text-muted-foreground">Staff Member</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Check In</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Check Out</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-bold text-primary">
                            {s.first_name[0]}{s.last_name[0]}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">{s.role.replace("_", " ")}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[statuses[s.id] ?? "present"].className}>
                        {statusConfig[statuses[s.id] ?? "present"].label}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatTime(s.attendance?.check_in_time)}</td>
                    <td className="p-4 text-muted-foreground">{formatTime(s.attendance?.check_out_time)}</td>
                    <td className="p-4">
                      <select
                        value={statuses[s.id] ?? "present"}
                        onChange={(e) => updateStatus(s.id, e.target.value as Status)}
                        className="rounded-md border border-border bg-card px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                        <option value="on_leave">On Leave</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
