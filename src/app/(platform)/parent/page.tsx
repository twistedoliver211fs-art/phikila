import { Baby, DollarSign, BookOpen, Calendar, Mail, AlertCircle, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function ParentPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

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

  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("student_id, status, date")
    .in("student_id", childIds)
    .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  const { data: accounts } = await supabase
    .from("student_accounts")
    .select("student_id, amount_due, amount_paid, balance")
    .in("student_id", childIds);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, created_at")
    .eq("school_id", schoolId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const getAttendanceRate = (studentId: string) => {
    const records = attendance?.filter((a) => a.student_id === studentId) ?? [];
    if (records.length === 0) return "—";
    const present = records.filter((a) => a.status === "present").length;
    return `${((present / records.length) * 100).toFixed(0)}%`;
  };

  const getBalance = (studentId: string) => {
    const account = accounts?.find((a) => a.student_id === studentId);
    return account ? Number(account.balance) : 0;
  };

  const quickAccess = [
    { label: "Attendance", href: "#attendance", icon: ClipboardCheck },
    { label: "Fees", href: "#fees", icon: DollarSign },
    { label: "Academics", href: "#academics", icon: BookOpen },
    { label: "Timetable", href: "#timetable", icon: Calendar },
    { label: "Messages", href: "#messages", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hello, Parent</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your {children?.length ?? 0} {children?.length === 1 ? "child" : "children"}.
        </p>
      </div>

      {/* Children */}
      <section id="children">
        <div className="flex items-center gap-2 mb-4">
          <Baby className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">My Children</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children && children.length > 0 ? (
            children.map((child) => (
              <div key={child.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {child.first_name[0]}{child.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {child.first_name} {child.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(child.classes as any)?.grades?.name ?? ""} {(child.classes as any)?.name ?? ""}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="text-sm font-semibold text-foreground">{getAttendanceRate(child.id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className={`text-sm font-semibold ${getBalance(child.id) > 0 ? "text-amber-600" : "text-green-600"}`}>
                      KES {getBalance(child.id).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center">
              <Baby className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No children linked to your account yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Fees */}
      <section id="fees" className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Fee Balances</h2>
        {accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((acc) => {
              const child = children?.find((c) => c.id === acc.student_id);
              return (
                <div key={acc.student_id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <span className="text-sm font-medium text-foreground">
                    {child ? `${child.first_name} ${child.last_name}` : "—"}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">Paid: KES {Number(acc.amount_paid).toLocaleString()}</p>
                    {Number(acc.balance) > 0 && (
                      <p className="text-xs text-amber-600">Balance: KES {Number(acc.balance).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No fee records found.</p>
        )}
      </section>

      {/* Announcements */}
      <section id="messages" className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">School Announcements</h2>
        {announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg border border-border/50 p-3">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No announcements yet.</p>
        )}
      </section>

      {/* Quick Access */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickAccess.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 hover:shadow-md transition-all"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
