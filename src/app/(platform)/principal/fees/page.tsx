import { DollarSign, TrendingUp, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function PrincipalFeesPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("student_accounts")
    .select("student_id, amount_due, amount_paid, balance");

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, payment_date, reference_number, student_accounts(student_id, students(first_name, last_name, classes(name, grades(name))))")
    .order("payment_date", { ascending: false })
    .limit(10);

  const totalDue = accounts?.reduce((a, acc) => a + Number(acc.amount_due), 0) ?? 0;
  const totalPaid = accounts?.reduce((a, acc) => a + Number(acc.amount_paid), 0) ?? 0;
  const totalBalance = accounts?.reduce((a, acc) => a + Number(acc.balance), 0) ?? 0;
  const collectionRate = totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fees & Finance</h1>
          <p className="text-muted-foreground mt-1">Fee collection overview</p>
        </div>
        <Button size="sm"><Download className="mr-2 h-4 w-4" />Export Report</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total Expected</span>
          </div>
          <p className="text-xl font-bold text-blue-600">KES {totalDue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Collected</span>
          </div>
          <p className="text-xl font-bold text-green-600">KES {totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Outstanding</span>
          </div>
          <p className="text-xl font-bold text-amber-600">KES {totalBalance.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Collection Rate</span>
          </div>
          <p className="text-xl font-bold text-primary">{collectionRate}%</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Student</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments && payments.length > 0 ? (
                payments.map((p) => {
                  const student = (p.student_accounts as any)?.students;
                  const className = student?.classes
                    ? `${student.classes.grades?.name ?? ""} ${student.classes.name ?? ""}`.trim()
                    : "—";
                  return (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">
                        {student ? `${student.first_name} ${student.last_name}` : "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">{className}</td>
                      <td className="p-4 font-medium text-green-600">KES {Number(p.amount).toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground">{p.payment_date}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{p.reference_number ?? "—"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Outstanding Balances</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Student</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Due</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Paid</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Balance</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts && accounts.filter((a) => Number(a.balance) > 0).length > 0 ? (
                accounts
                  .filter((a) => Number(a.balance) > 0)
                  .map((a) => (
                    <tr key={a.student_id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-muted-foreground">Student #{a.student_id.slice(0, 8)}</td>
                      <td className="p-4 text-muted-foreground">KES {Number(a.amount_due).toLocaleString()}</td>
                      <td className="p-4 text-green-600">KES {Number(a.amount_paid).toLocaleString()}</td>
                      <td className="p-4 font-medium text-red-600">KES {Number(a.balance).toLocaleString()}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">Send Reminder</Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No outstanding balances.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
