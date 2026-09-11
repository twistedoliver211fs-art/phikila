"use client";

import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SchoolModeBanner({ schoolName }: { schoolName: string }) {
  const [exiting, setExiting] = useState(false);
  const [error, setError] = useState("");

  async function exitSchool() {
    if (exiting) return;
    setExiting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/exit-school", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.redirectTo) {
        setError(data.error || "Failed to exit school. Please try again.");
        setExiting(false);
        return;
      }

      window.location.href = data.redirectTo;
    } catch {
      setError("Network error. Please try again.");
      setExiting(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 sm:px-6">
      <p className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Super Admin · {schoolName} · Principal View
        </span>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        {error && (
          <span className="text-xs font-medium text-red-600">{error}</span>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={exitSchool}
          disabled={exiting}
          className="h-7 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
        >
          <LogOut className="mr-1 h-3.5 w-3.5" />
          {exiting ? "Exiting..." : "Exit School"}
        </Button>
      </div>
    </div>
  );
}