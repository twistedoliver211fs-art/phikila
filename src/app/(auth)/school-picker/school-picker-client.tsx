"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/auth-config";

interface Membership {
  role: string;
  schoolId: string;
  schoolName: string | null;
}

interface SchoolPickerProps {
  members: Membership[];
  email: string;
}

export function SchoolPicker({ members, email }: SchoolPickerProps) {
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function selectSchool(membership: Membership) {
    if (picking) return;
    setPicking(membership.schoolId);
    setError("");

    try {
      const res = await fetch("/api/auth/set-active-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: membership.schoolId,
          role: membership.role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.redirectTo) {
        setError(data.error || "Failed to switch school. Please try again.");
        setPicking(null);
        return;
      }

      // Full page load so the server re-resolves the role for the new school.
      window.location.href = data.redirectTo;
    } catch {
      setError("Network error. Please try again.");
      setPicking(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>

          <h1 className="text-center text-2xl font-bold text-foreground">
            Choose your school
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your account belongs to more than one school. Select one to
            continue.
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground/70">
            Signed in as {email}
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {members.map((m) => {
              const roleLabel = ROLE_LABELS[m.role] ?? m.role;
              const isPicking = picking === m.schoolId;
              return (
                <button
                  key={`${m.schoolId}-${m.role}`}
                  type="button"
                  disabled={picking !== null}
                  onClick={() => selectSchool(m)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {m.schoolName ?? "School"}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {roleLabel}
                    </p>
                  </div>
                  {isPicking ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                  ) : (
                    <span className="shrink-0 text-xs font-medium text-primary">
                      Continue →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}