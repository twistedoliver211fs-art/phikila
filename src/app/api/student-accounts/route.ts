import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const GET = createRoute(async ({ user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "students", "read");

  const admin = createAdminClient();
  const { data: accounts } = await admin
    .from("student_accounts")
    .select("id, student_id, amount_due, amount_paid, balance, students(id, first_name, last_name, classes(name, grades(name)))")
    .eq("school_id", ctx.schoolId);

  const mapped = (accounts ?? []).map((a: any) => {
    const student = a.students;
    const className = student?.classes
      ? `${student.classes.grades?.name ?? ""} ${student.classes.name ?? ""}`.trim()
      : "";
    return {
      id: a.id,
      studentId: a.student_id,
      studentName: student ? `${student.first_name} ${student.last_name}` : "—",
      className,
      totalDue: Number(a.amount_due),
      totalPaid: Number(a.amount_paid),
      balance: Number(a.balance),
    };
  });

  return NextResponse.json({ studentAccounts: mapped });
});
