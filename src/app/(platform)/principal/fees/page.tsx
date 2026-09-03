import { DollarSign, TrendingUp, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const feeSummary = [
  { label: "Total Expected", value: "KES 4,800,000", icon: DollarSign, color: "text-blue-600" },
  { label: "Collected", value: "KES 3,200,000", icon: TrendingUp, color: "text-green-600" },
  { label: "Outstanding", value: "KES 1,600,000", icon: AlertCircle, color: "text-amber-600" },
  { label: "Collection Rate", value: "66.7%", icon: TrendingUp, color: "text-primary" },
];

const recentPayments = [
  { student: "Amara Okafor", grade: "8A", amount: "KES 25,000", date: "Sep 2, 2026", method: "M-Pesa" },
  { student: "Liam Petrov", grade: "8A", amount: "KES 25,000", date: "Sep 1, 2026", method: "Bank Transfer" },
  { student: "Sofia Reyes", grade: "7B", amount: "KES 12,500", date: "Aug 30, 2026", method: "M-Pesa" },
  { student: "Chen Wei", grade: "7A", amount: "KES 25,000", date: "Aug 28, 2026", method: "Cash" },
];

const defaulters = [
  { student: "Fatima Al-Hassan", grade: "8A", owed: "KES 50,000", daysOverdue: 45 },
  { student: "James Oduya", grade: "6A", owed: "KES 25,000", daysOverdue: 30 },
  { student: "Priya Sharma", grade: "8A", owed: "KES 12,500", daysOverdue: 15 },
];

export default function PrincipalFeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fees & Finance</h1>
          <p className="text-muted-foreground mt-1">Fee collection overview</p>
        </div>
        <Button size="sm"><Download className="mr-2 h-4 w-4" />Export Report</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {feeSummary.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{item.label}</span>
            </div>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Student</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Grade</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Method</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{p.student}</td>
                  <td className="p-4 text-muted-foreground">{p.grade}</td>
                  <td className="p-4 font-medium text-green-600">{p.amount}</td>
                  <td className="p-4 text-muted-foreground">{p.date}</td>
                  <td className="p-4 text-muted-foreground">{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Defaulters */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Outstanding Balances</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Student</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Grade</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Amount Owed</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Days Overdue</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {defaulters.map((d, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{d.student}</td>
                  <td className="p-4 text-muted-foreground">{d.grade}</td>
                  <td className="p-4 font-medium text-red-600">{d.owed}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${d.daysOverdue > 30 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {d.daysOverdue} days
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">Send Reminder</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
