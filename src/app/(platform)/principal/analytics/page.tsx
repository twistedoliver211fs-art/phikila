"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, GraduationCap, DollarSign, TrendingUp, BarChart3 } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalStaff: number;
  totalClasses: number;
  attendanceRate: number;
  totalRevenue: number;
  outstandingFees: number;
  recentEnrollments: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">School performance metrics and insights</p>
        </div>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading analytics...</p>
      ) : !stats ? (
        <p className="text-muted-foreground">No data available</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">{stats.activeStudents} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                <p className="text-xs text-muted-foreground">{stats.totalClasses} classes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  KES {stats.outstandingFees.toLocaleString()} outstanding
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recent Enrollments (30d)</span>
                  <span className="font-medium">{stats.recentEnrollments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <span className="font-medium">{stats.activeStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Classes</span>
                  <span className="font-medium">{stats.totalClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Outstanding Fees</span>
                  <span className="font-medium text-red-600">
                    KES {stats.outstandingFees.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Collected</span>
                    <span className="font-medium text-green-600">
                      KES {stats.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Outstanding</span>
                    <span className="font-medium text-red-600">
                      KES {stats.outstandingFees.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Collection Rate</span>
                    <span className="font-medium">
                      {stats.totalRevenue + stats.outstandingFees > 0
                        ? ((stats.totalRevenue / (stats.totalRevenue + stats.outstandingFees)) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
