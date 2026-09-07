import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function ParentAttendancePage() {
  const supabase = await createClient();
  const schoolId = await getCurrentSchoolId();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: children } = await supabase
    .from("students")
    .select("id, first_name, last_name, class_id, classes(name, grades(name))")
    .eq("school_id", schoolId)
    .eq("parent_user_id", user?.id)
    .eq("is_active", true);

  const childIds = children?.map((c) => c.id) ?? [];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("student_id, date, status")
    .eq("school_id", schoolId)
    .in("student_id", childIds.length > 0 ? childIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: false });

  const getChildAttendance = (childId: string) => {
    const records = attendance?.filter((a) => a.student_id === childId) ?? [];
    const total = records.length;
    const present = records.filter((a) => a.status === "present" || a.status === "late").length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(0) : "—";
    return { total, present, rate };
  };

  const statusColors: Record<string, string> = {
    present: "bg-green-50 text-green-700",
    absent: "bg-red-50 text-red-700",
    late: "bg-amber-50 text-amber-700",
    excused: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Last 30 days attendance for your children</p>
      </div>

      {children && children.length > 0 ? (
        children.map((child) => {
          const att = getChildAttendance(child.id);
          const records = attendance?.filter((a) => a.student_id === child.id) ?? [];
          const className = `${(child.classes as any)?.grades?.[0]?.name ?? ""} ${(child.classes as any)?.name ?? ""}`.trim();
          return (
            <div key={child.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{child.first_name} {child.last_name}</h2>
                  <p className="text-sm text-muted-foreground">{className}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{att.rate}%</p>
                  <p className="text-xs text-muted-foreground">{att.present}/{att.total} days present</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.slice(0, 10).map((r) => (
                        <tr key={r.date} className="border-b border-border/50 last:border-0">
                          <td className="p-3 text-muted-foreground">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[r.status] ?? "bg-gray-50 text-gray-700"}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-muted-foreground">No attendance records yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No children linked to your account.</p>
        </div>
      )}
    </div>
  );
}
