"use client";

import { useState } from "react";
import { Download, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeeAccount {
  student_id: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  students?: any;
}

export function FeesActions({ accounts }: { accounts: FeeAccount[] }) {
  const [showReminderModal, setShowReminderModal] = useState(false);

  const handleExport = () => {
    const overdue = accounts.filter((a) => Number(a.balance) > 0);
    const headers = ["Student", "Balance"];
    const rows = overdue.map((a) => {
      const s = a.students;
      const name = s ? `${s.first_name} ${s.last_name}` : "—";
      return [name, String(a.balance)];
    });

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `overdue-fees-${new Date().toISOString().split("T")[0]}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const overdueCount = accounts.filter((a) => Number(a.balance) > 0).length;

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />Export Report
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowReminderModal(true)}>
          <Bell className="mr-2 h-4 w-4" />Send Reminder
        </Button>
      </div>

      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowReminderModal(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Send Fee Reminder</h2>
              <button onClick={() => setShowReminderModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {overdueCount} student(s) have outstanding fee balances. SMS/email reminders will be sent to parents.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This feature is coming soon.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowReminderModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
