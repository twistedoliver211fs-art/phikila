import { createAdminClient } from "@/lib/supabase/server-admin";

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalStaff: number;
  totalClasses: number;
  attendanceRate: number;
  totalRevenue: number;
  outstandingFees: number;
  recentEnrollments: number;
}

export interface EnrollmentTrend {
  month: string;
  count: number;
}

export interface AttendanceTrend {
  date: string;
  rate: number;
}

export interface RevenueTrend {
  month: string;
  collected: number;
  outstanding: number;
}

export interface ClassPerformance {
  className: string;
  averageScore: number;
  studentCount: number;
}

export async function getDashboardStats(schoolId: string): Promise<DashboardStats> {
  const admin = createAdminClient();

  const [studentsResult, staffResult, classesResult, attendanceResult, paymentsResult, invoicesResult, enrollmentsResult] = await Promise.all([
    admin.from("students").select("id, is_active", { count: "exact" }).eq("school_id", schoolId),
    admin.from("staff").select("id", { count: "exact" }).eq("school_id", schoolId),
    admin.from("classes").select("id", { count: "exact" }).eq("school_id", schoolId),
    admin.from("attendance_records").select("status").eq("school_id", schoolId).gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
    admin.from("payments").select("amount").eq("school_id", schoolId),
    admin.from("invoices").select("amount_due, amount_paid, balance").eq("school_id", schoolId),
    admin.from("students").select("id", { count: "exact" }).eq("school_id", schoolId).gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const totalStudents = studentsResult.count ?? 0;
  const activeStudents = (studentsResult.data ?? []).filter((s) => s.is_active).length;
  const totalStaff = staffResult.count ?? 0;
  const totalClasses = classesResult.count ?? 0;

  const attendanceRecords = attendanceResult.data ?? [];
  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const attendanceRate = attendanceRecords.length > 0 ? (presentCount / attendanceRecords.length) * 100 : 0;

  const totalRevenue = (paymentsResult.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const outstandingFees = (invoicesResult.data ?? []).reduce((sum, i) => sum + Number(i.balance), 0);

  const recentEnrollments = enrollmentsResult.count ?? 0;

  return {
    totalStudents,
    activeStudents,
    totalStaff,
    totalClasses,
    attendanceRate,
    totalRevenue,
    outstandingFees,
    recentEnrollments,
  };
}

export async function getEnrollmentTrend(schoolId: string): Promise<EnrollmentTrend[]> {
  const admin = createAdminClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await admin
    .from("students")
    .select("created_at")
    .eq("school_id", schoolId)
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at");

  if (error) throw error;

  const monthly = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthly.set(d.toISOString().slice(0, 7), 0);
  }

  for (const row of data ?? []) {
    const month = (row.created_at as string).slice(0, 7);
    monthly.set(month, (monthly.get(month) ?? 0) + 1);
  }

  return Array.from(monthly.entries()).map(([month, count]) => ({ month, count }));
}

export async function getAttendanceTrend(schoolId: string): Promise<AttendanceTrend[]> {
  const admin = createAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await admin
    .from("attendance_records")
    .select("date, status")
    .eq("school_id", schoolId)
    .gte("date", thirtyDaysAgo)
    .order("date");

  if (error) throw error;

  const byDate = new Map<string, { total: number; present: number }>();
  for (const row of data ?? []) {
    const date = row.date as string;
    const entry = byDate.get(date) ?? { total: 0, present: 0 };
    entry.total++;
    if (row.status === "present") entry.present++;
    byDate.set(date, entry);
  }

  return Array.from(byDate.entries()).map(([date, { total, present }]) => ({
    date,
    rate: total > 0 ? (present / total) * 100 : 0,
  }));
}

export async function getRevenueTrend(schoolId: string): Promise<RevenueTrend[]> {
  const admin = createAdminClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [paymentsResult, invoicesResult] = await Promise.all([
    admin.from("payments").select("amount, created_at").eq("school_id", schoolId).gte("created_at", sixMonthsAgo.toISOString()),
    admin.from("invoices").select("amount_paid, balance, created_at").eq("school_id", schoolId).gte("created_at", sixMonthsAgo.toISOString()),
  ]);

  const monthlyPayments = new Map<string, number>();
  const monthlyOutstanding = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    monthlyPayments.set(key, 0);
    monthlyOutstanding.set(key, 0);
  }

  for (const row of paymentsResult.data ?? []) {
    const month = (row.created_at as string).slice(0, 7);
    monthlyPayments.set(month, (monthlyPayments.get(month) ?? 0) + Number(row.amount));
  }

  for (const row of invoicesResult.data ?? []) {
    const month = (row.created_at as string).slice(0, 7);
    monthlyOutstanding.set(month, (monthlyOutstanding.get(month) ?? 0) + Number(row.balance));
  }

  return Array.from(monthlyPayments.entries()).map(([month, collected]) => ({
    month,
    collected,
    outstanding: monthlyOutstanding.get(month) ?? 0,
  }));
}

export async function getClassPerformance(schoolId: string): Promise<ClassPerformance[]> {
  const admin = createAdminClient();

  const { data: classes } = await admin
    .from("classes")
    .select("id, name")
    .eq("school_id", schoolId);

  if (!classes) return [];

  const results: ClassPerformance[] = [];

  for (const cls of classes) {
    const { data: students } = await admin
      .from("students")
      .select("id")
      .eq("class_id", cls.id)
      .eq("is_active", true);

    if (!students || students.length === 0) continue;

    const studentIds = students.map((s) => s.id);

    const { data: examResults } = await admin
      .from("exam_results")
      .select("score")
      .in("student_id", studentIds);

    const scores = (examResults ?? []).map((r) => Number(r.score));
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    results.push({
      className: cls.name,
      averageScore: avg,
      studentCount: students.length,
    });
  }

  return results;
}
