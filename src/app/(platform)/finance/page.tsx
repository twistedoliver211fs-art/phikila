import { DollarSign, TrendingUp, AlertCircle, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function FinancePage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("student_accounts")
    .select("student_id, amount_due, amount_paid, balance")
    .eq("school_id", schoolId);

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, payment_date, reference_number, notes, student_accounts(student_id, students(first_name, last_name, classes(name, grades(name))))")
    .eq("school_id", schoolId)
    .order("payment_date", { ascending: false })
    .limit(20);

  const { data: feeStructures } = await supabase
    .from("fee_structures")
    .select("id, name, amount")
    .eq("school_id", schoolId);

  const totalDue = accounts?.reduce((a, acc) => a + Number(acc.amount_due), 0) ?? 0;
  const totalPaid = accounts?.reduce((a, acc) => a + Number(acc.amount_paid), 0) ?? 0;
  const totalBalance = accounts?.reduce((a, acc) => a + Number(acc.balance), 0) ?? 0;
  const collectionRate = totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : "0";

  const recentTotal = payments?.slice(0, 10).reduce((a, p) => a + Number(p.amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance</h1>
          <p className="text-muted-foreground mt-1">Fee collection and payment tracking</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm"><DollarSign className="mr-2 h-4 w-4" />Record Payment</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Total Expected</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">KES {totalDue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Collected</span>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">KES {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">{collectionRate}% collection rate</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Outstanding</span>
            <ArrowDownRight className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">KES {totalBalance.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Fee Structures</span>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{feeStructures?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">configured</p>
        </div>
      </div>

      {/* Fee Structures */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Fee Structures</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Structure</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {feeStructures && feeStructures.length > 0 ? (
                feeStructures.map((f) => (
                  <tr key={f.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{f.name}</td>
                    <td className="p-4 text-muted-foreground">KES {Number(f.amount).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-muted-foreground">
                    No fee structures configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Payments</h2>
            <span className="text-xs text-muted-foreground">Last 10 — KES {recentTotal.toLocaleString()} total</span>
          </div>
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
                    No payments recorded.
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
