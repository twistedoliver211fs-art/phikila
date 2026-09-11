"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { School, Users, GraduationCap, DollarSign, Activity, RefreshCw, ArrowUpRight, AlertTriangle } from "lucide-react";

interface PlatformStats {
  totalSchools: number;
  activeSchools: number;
  totalUsers: number;
  activeSubscriptions: number;
  totalStudents: number;
  totalStaff: number;
  revenue: number;
}

interface CapacityMetric {
  label: string;
  current: number;
  limit: number;
  unit: string;
}

interface UpgradeTier {
  name: string;
  database: string;
  apiRequests: string;
  connections: string;
  price: string;
}

interface CapacityData {
  plan: string;
  metrics: CapacityMetric[];
  upgradeTier: UpgradeTier | null;
}

function getCapacityColor(percent: number): "green" | "yellow" | "orange" | "red" {
  if (percent < 50) return "green";
  if (percent < 70) return "yellow";
  if (percent < 90) return "orange";
  return "red";
}

const colorClasses: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

function Progress({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorClasses[color]}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const badgeColor: Record<string, string> = {
    Free: "bg-muted text-muted-foreground",
    Pro: "bg-blue-100 text-blue-700",
    Team: "bg-purple-100 text-purple-700",
    Enterprise: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor[plan] ?? badgeColor.Free}`}>
      {plan}
    </span>
  );
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [capacity, setCapacity] = useState<CapacityData | null>(null);
  const [capacityLoading, setCapacityLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/platform");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch {
        console.error("Failed to fetch platform stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  async function fetchCapacity() {
    try {
      const res = await fetch("/api/platform/capacity");
      if (res.ok) {
        const data = await res.json();
        setCapacity(data);
      }
    } catch {
      console.error("Failed to fetch capacity data");
    } finally {
      setCapacityLoading(false);
    }
  }

  useEffect(() => {
    fetchCapacity();
    const interval = setInterval(fetchCapacity, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground">Decimal platform overview and management</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !stats ? (
        <p className="text-muted-foreground">No data available</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSchools}</div>
                <p className="text-xs text-muted-foreground">{stats.activeSchools} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Across all schools</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">{stats.totalStaff} staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSubscriptions} active subs
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/super-admin/schools" className="block p-2 rounded-lg hover:bg-muted text-sm">
                  Manage Schools
                </a>
                <a href="/super-admin/users" className="block p-2 rounded-lg hover:bg-muted text-sm">
                  Manage Users
                </a>
                <a href="/super-admin/audit" className="block p-2 rounded-lg hover:bg-muted text-sm">
                  View Audit Log
                </a>
                <a href="/super-admin/settings" className="block p-2 rounded-lg hover:bg-muted text-sm">
                  Platform Settings
                </a>
                <a href="/super-admin/feature-flags" className="block p-2 rounded-lg hover:bg-muted text-sm">
                  Feature Flags
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Platform Status</span>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <Activity className="h-4 w-4" />
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Subscriptions</span>
                  <span className="font-medium">{stats.activeSubscriptions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Schools</span>
                  <span className="font-medium">{stats.activeSchools}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Capacity</CardTitle>
              <CardAction>
                <button onClick={() => { setCapacityLoading(true); fetchCapacity(); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3 w-3" />
                  Live
                </button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {capacityLoading ? (
                <p className="text-muted-foreground text-sm">Loading capacity data...</p>
              ) : !capacity ? (
                <p className="text-muted-foreground text-sm">Capacity data unavailable</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <PlanBadge plan={capacity.plan} />
                    </div>
                    {capacity.upgradeTier && (
                      <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        Upgrade
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {capacity.metrics.map((metric) => {
                      const percent = Math.round((metric.current / metric.limit) * 100);
                      const color = getCapacityColor(percent);
                      return (
                        <div key={metric.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{metric.label}</span>
                            <span className="font-medium">
                              {metric.current.toLocaleString()} / {metric.limit.toLocaleString()}{metric.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress percent={percent} color={color} />
                            <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">{percent}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {capacity.upgradeTier && capacity.metrics.some((m) => (m.current / m.limit) >= 0.7) && (
                    <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">
                            {capacity.metrics.filter((m) => (m.current / m.limit) >= 0.7).map((m) => m.label).join(", ")} approaching limit
                          </p>
                          <p className="text-muted-foreground mt-1">
                            Upgrade to {capacity.upgradeTier.name}: {capacity.upgradeTier.database} database, {capacity.upgradeTier.apiRequests} API requests, {capacity.upgradeTier.connections} connections — {capacity.upgradeTier.price}
                          </p>
                        </div>
                        <button className="ml-auto flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0">
                          Upgrade Now
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
