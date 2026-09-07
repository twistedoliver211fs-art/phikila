"use client";

import { useState } from "react";
import { Download, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  reference_number: string | null;
  student_accounts: any;
}

export function FinanceActions({ payments }: { payments: Payment[] }) {
  const [showRecordModal, setShowRecordModal] = useState(false);

  const handleExport = () => {
    const headers = ["Student", "Amount", "Date", "Reference"];
    const rows = payments.map((p) => {
      const student = (p.student_accounts as any)?.students;
      const name = student ? `${student.first_name} ${student.last_name}` : "—";
      return [name, String(p.amount), p.payment_date, p.reference_number ?? "—"];
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
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />Export
        </Button>
        <Button size="sm" onClick={() => setShowRecordModal(true)}>
          <DollarSign className="mr-2 h-4 w-4" />Record Payment
        </Button>
      </div>

      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRecordModal(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Record Payment</h2>
              <button onClick={() => setShowRecordModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Payment recording form coming soon. This will allow you to record student fee payments.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowRecordModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
