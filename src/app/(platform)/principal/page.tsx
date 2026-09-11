import Link from "next/link";
import {
  AlertTriangle,
  Users,
  DollarSign,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { NotificationCenter } from "@/components/platform/notification-center";

export default async function PrincipalPage() {
  const supabase = await createClient();
  const schoolId = await getCurrentSchoolId();

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { count: totalStudents } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_active", true);

  const { data: todayAttendance } = await supabase
    .from("attendance_records")
    .select("status")
    .eq("school_id", schoolId)
    .eq("date", todayDate);

  const presentToday = todayAttendance?.filter((a) => a.status === "present" || a.status === "late").length ?? 0;
  const studentAttendanceRate = (totalStudents ?? 0) > 0
    ? ((presentToday / (totalStudents ?? 1)) * 100).toFixed(0)
    : "0";

  const { count: totalStaff } = await supabase
    .from("staff")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_active", true);

  const { data: staffTodayAttendance } = await supabase
    .from("staff_attendance")
    .select("status")
    .eq("school_id", schoolId)
    .eq("date", todayDate);

  const staffPresentToday = staffTodayAttendance?.filter((a) => a.status === "present" || a.status === "late").length ?? 0;
  const staffAbsentTodayCount = staffTodayAttendance?.filter((a) => a.status === "absent").length ?? 0;
  const staffLateTodayCount = staffTodayAttendance?.filter((a) => a.status === "late").length ?? 0;
  const staffAttendanceRate = (totalStaff ?? 0) > 0
    ? ((staffPresentToday / (totalStaff ?? 1)) * 100).toFixed(0)
    : "0";

  const { data: feeAccounts } = await supabase
    .from("student_accounts")
    .select("amount_due, amount_paid, balance")
    .eq("school_id", schoolId);

  const totalDue = feeAccounts?.reduce((a, acc) => a + Number(acc.amount_due), 0) ?? 0;
  const totalPaid = feeAccounts?.reduce((a, acc) => a + Number(acc.amount_paid), 0) ?? 0;
  const feeCollectionRate = totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(0) : "0";

  const overdueAccounts = feeAccounts?.filter((a) => Number(a.balance) > 0).length ?? 0;

  const { count: pendingAdmissions } = await supabase
    .from("admissions")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("status", "pending");

  const { data: weekAttendance } = await supabase
    .from("attendance_records")
    .select("student_id, status")
    .eq("school_id", schoolId)
    .gte("date", weekAgo)
    .lte("date", todayDate);

  const absenceCounts: Record<string, number> = {};
  weekAttendance?.forEach((a) => {
    if (a.status === "absent") {
      absenceCounts[a.student_id] = (absenceCounts[a.student_id] || 0) + 1;
    }
  });
  const attendanceConcerns = Object.values(absenceCounts).filter((c) => c >= 3).length;

  const attentionItems = [];
  if (attendanceConcerns > 0) {
    attentionItems.push({
      icon: Users,
      title: `${attendanceConcerns} attendance concerns`,
      description: "Students with 3+ absences this week",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      action: "View Attendance",
      href: "/principal/attendance",
    });
  }
  if (staffAbsentTodayCount > 0) {
    attentionItems.push({
      icon: AlertTriangle,
      title: `${staffAbsentTodayCount} staff member(s) absent`,
      description: "Coverage needed for today",
      color: "text-red-600 bg-red-50 border-red-200",
      action: "Staff Attendance",
      href: "/principal/staff-attendance",
    });
  }
  if (overdueAccounts > 0) {
    attentionItems.push({
      icon: DollarSign,
      title: `${overdueAccounts} overdue fee accounts`,
      description: "Payments past due date",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      action: "Review Fees",
      href: "/principal/fees",
    });
  }
  if ((pendingAdmissions ?? 0) > 0) {
    attentionItems.push({
      icon: UserCheck,
      title: `${pendingAdmissions} admissions pending`,
      description: "Applications awaiting review",
      color: "text-green-600 bg-green-50 border-green-200",
      action: "Review Admissions",
      href: "/principal/admissions",
    });
  }

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Onboarding: check whether the academic structure exists yet.
  const [hasYear, hasGrades] = await Promise.all([
    supabase.from("academic_years").select("id").eq("school_id", schoolId).limit(1),
    supabase.from("grades").select("id").eq("school_id", schoolId).limit(1),
  ]);
  const needsSetup = (hasYear.data?.length ?? 0) === 0 || (hasGrades.data?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what needs attention at your school.
        </p>
      </div>

      {needsSetup && (
        <Link
          href="/onboarding"
          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
        >
          <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Finish setting up your school</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add your academic year, grades, classes, subjects and bell periods before staff and students start.
            </p>
          </div>
          <span className="text-sm font-semibold text-primary">Set up →</span>
        </Link>
      )}

      {attentionItems.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Needs Your Attention
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attentionItems.map((item) => (
              <div
                key={item.title}
                className={`flex items-start gap-3 rounded-lg border p-4 ${item.color}`}
              >
                <item.icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs opacity-80 mt-0.5">{item.description}</p>
                  <Link
                    href={item.href}
                    className="mt-2 inline-block text-xs font-semibold underline opacity-90 hover:opacity-100"
                  >
                    {item.action}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-2">
            All systems operating normally
          </h2>
          <p className="text-sm text-muted-foreground">
            No issues require your attention right now.
          </p>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Today&apos;s School Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Student Attendance
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {studentAttendanceRate}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Staff Attendance
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {staffAttendanceRate}%
            </p>
            <Link href="/principal/staff-attendance" className="mt-1 text-xs text-primary hover:underline">
              {staffAbsentTodayCount} absent, {staffLateTodayCount} late
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Fee Collection
            </p>
            <p className={`mt-2 text-2xl font-bold ${Number(feeCollectionRate) >= 80 ? "text-green-600" : "text-amber-600"}`}>
              {feeCollectionRate}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Admissions Pending
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {pendingAdmissions ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          School Performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Students
            </p>
            <div className="mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-foreground">{totalStudents ?? 0}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Staff
            </p>
            <div className="mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-foreground">{totalStaff ?? 0}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Fee Revenue
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                KES {totalPaid.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Outstanding
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-amber-600">
                KES {(totalDue - totalPaid).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <NotificationCenter />
    </div>
  );
}
