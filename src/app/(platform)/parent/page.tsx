"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Baby, ClipboardCheck, DollarSign, BookOpen, Calendar, Megaphone, Mail } from "lucide-react";

interface Child {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  className: string;
  gradeName: string;
  relationshipType: string;
}

interface AttendanceRecord {
  date: string;
  status: string;
  className: string;
}

interface FeeRecord {
  invoiceId: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate: string | null;
  feeName: string;
}

const statusColors: Record<string, string> = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-yellow-100 text-yellow-800",
  excused: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  partial: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [childrenRes, messagesRes] = await Promise.all([
          fetch("/api/parent/children"),
          fetch("/api/parent/messages"),
        ]);
        if (childrenRes.ok) {
          const data = await childrenRes.json();
          setChildren(data.children ?? []);
          if (data.children?.length > 0) {
            setSelectedChild(data.children[0]);
          }
        }
        if (messagesRes.ok) {
          const data = await messagesRes.json();
          setUnreadMessages(data.unreadCount ?? 0);
        }
      } catch {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    async function fetchChildData() {
      try {
        const [attRes, feeRes] = await Promise.all([
          fetch(`/api/parent/attendance?studentId=${selectedChild!.studentId}`),
          fetch(`/api/parent/fees?studentId=${selectedChild!.studentId}`),
        ]);
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttendance(attData.attendance ?? []);
        }
        if (feeRes.ok) {
          const feeData = await feeRes.json();
          setFees(feeData.fees ?? []);
        }
      } catch {
        console.error("Failed to fetch child data");
      }
    }
    fetchChildData();
  }, [selectedChild]);

  const totalOwed = fees.reduce((sum, f) => sum + f.balance, 0);
  const presentDays = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? (presentDays / attendance.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parent Portal</h1>
        <p className="text-muted-foreground">View your children&apos;s attendance, fees, and progress</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Baby className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No children linked to your account</p>
            <p className="text-sm mt-2">Contact your school administrator to link your children</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/parent/timetable">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Timetable</p>
                    <p className="text-xs text-muted-foreground">View class schedule</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/parent/announcements">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Megaphone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Announcements</p>
                    <p className="text-xs text-muted-foreground">School news & updates</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/parent/messages">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Messages</p>
                    <p className="text-xs text-muted-foreground">
                      {unreadMessages > 0 ? (
                        <span className="text-green-600 font-medium">{unreadMessages} unread</span>
                      ) : (
                        "Inbox"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="flex gap-2 flex-wrap">
            {children.map((child) => (
              <button
                key={child.studentId}
                onClick={() => setSelectedChild(child)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedChild?.studentId === child.studentId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {child.firstName} {child.lastName}
              </button>
            ))}
          </div>

          {selectedChild && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {presentDays}/{attendance.length} days present
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KES {totalOwed.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{fees.length} invoices</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedChild.className}</div>
                    <p className="text-xs text-muted-foreground">{selectedChild.gradeName}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendance.length === 0 ? (
                      <p className="text-muted-foreground">No attendance records</p>
                    ) : (
                      <div className="space-y-2">
                        {attendance.slice(0, 10).map((record, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                            <span className="text-sm">{new Date(record.date).toLocaleDateString()}</span>
                            <Badge className={statusColors[record.status] ?? "bg-gray-100 text-gray-800"}>
                              {record.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fee Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fees.length === 0 ? (
                      <p className="text-muted-foreground">No fee records</p>
                    ) : (
                      <div className="space-y-2">
                        {fees.slice(0, 10).map((fee) => (
                          <div key={fee.invoiceId} className="flex items-center justify-between p-2 rounded-lg border">
                            <div>
                              <p className="text-sm font-medium">{fee.feeName}</p>
                              <p className="text-xs text-muted-foreground">{fee.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">KES {fee.balance.toLocaleString()}</p>
                              <Badge className={statusColors[fee.status] ?? "bg-gray-100 text-gray-800"}>
                                {fee.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
