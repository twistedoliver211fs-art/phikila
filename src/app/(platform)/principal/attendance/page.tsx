"use client";

import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const classes = [
  { name: "Grade 8A", teacher: "John Mwangi", present: 28, absent: 3, late: 1, total: 32 },
  { name: "Grade 8B", teacher: "Grace Wambui", present: 26, absent: 4, late: 2, total: 32 },
  { name: "Grade 7A", teacher: "Peter Ochieng", present: 30, absent: 1, late: 1, total: 32 },
  { name: "Grade 7B", teacher: "Sarah Akinyi", present: 25, absent: 5, late: 2, total: 32 },
  { name: "Grade 6A", teacher: "John Mwangi", present: 29, absent: 2, late: 1, total: 32 },
  { name: "Grade 6B", teacher: "Grace Wambui", present: 27, absent: 3, late: 2, total: 32 },
];

export default function PrincipalAttendancePage() {
  const [selectedDate, setSelectedDate] = useState("2026-09-03");

  const totalPresent = classes.reduce((a, c) => a + c.present, 0);
  const totalAbsent = classes.reduce((a, c) => a + c.absent, 0);
  const totalLate = classes.reduce((a, c) => a + c.late, 0);
  const totalStudents = classes.reduce((a, c) => a + c.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Overview</h1>
          <p className="text-muted-foreground mt-1">School-wide attendance for today</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <ChevronLeft className="h-4 w-4 text-muted-foreground cursor-pointer" />
          <span className="text-sm font-medium text-foreground">{selectedDate}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Present</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{totalPresent}</p>
          <p className="text-xs text-green-600">{((totalPresent / totalStudents) * 100).toFixed(1)}% rate</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Absent</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{totalAbsent}</p>
          <p className="text-xs text-red-600">{((totalAbsent / totalStudents) * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Late</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{totalLate}</p>
          <p className="text-xs text-amber-600">{((totalLate / totalStudents) * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
          <p className="text-xs text-muted-foreground">enrolled</p>
        </div>
      </div>

      {/* Class breakdown */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Class Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Teacher</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Present</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Absent</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Late</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Rate</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.name} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{c.name}</td>
                  <td className="p-4 text-muted-foreground">{c.teacher}</td>
                  <td className="p-4 text-green-600 font-medium">{c.present}</td>
                  <td className="p-4 text-red-600 font-medium">{c.absent}</td>
                  <td className="p-4 text-amber-600 font-medium">{c.late}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(c.present / c.total) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{((c.present / c.total) * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
