"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentsList({ payments }: { payments: any[] }) {
  const [query, setQuery] = useState("");

  const filtered = payments.filter((p) => {
    const q = query.toLowerCase();
    const student = p.student_accounts?.students;
    const name = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : "";
    return !q || name.includes(q) || p.reference_number?.toLowerCase().includes(q);
  });

  const handleExport = () => {
    const headers = ["Student", "Class", "Amount", "Date", "Reference"];
    const rows = filtered.map((p) => {
      const s = p.student_accounts?.students;
      const name = s ? `${s.first_name} ${s.last_name}` : "—";
      const cls = s?.classes ? `${s.classes.grades?.[0]?.name ?? ""} ${s.classes.name ?? ""}`.trim() : "—";
      return [name, cls, String(p.amount), p.payment_date, p.reference_number ?? "—"];
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">{payments.length} total payments recorded</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by student or reference..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Student</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const s = p.student_accounts?.students;
                  const cls = s?.classes
                    ? `${s.classes.grades?.[0]?.name ?? ""} ${s.classes.name ?? ""}`.trim()
                    : "—";
                  return (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">
                        {s ? `${s.first_name} ${s.last_name}` : "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">{cls}</td>
                      <td className="p-4 font-medium text-green-600">KES {Number(p.amount).toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground">{p.payment_date}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{p.reference_number ?? "—"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    {query ? "No payments match your search." : "No payments recorded yet."}
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
