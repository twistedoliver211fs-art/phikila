"use client";

import { useEffect, useState } from "react";
import { Building2, Check, ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "@/lib/auth-config";

interface Membership {
  role: string;
  schoolId: string;
  schoolName: string;
}

/**
 * Header school context. Always shows the current school's name so the user
 * knows which school they are operating in. For users with more than one
 * active membership it becomes a dropdown switcher: picking a school posts to
 * /api/auth/set-active-school, which persists profiles.active_school_id (the
 * server-side school context) and records the chosen role before doing a full
 * page load so middleware and server components re-resolve the new school.
 */
export function SchoolSwitcher() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const [{ data: members }, { data: profile }] = await Promise.all([
        supabase
          .from("school_members")
          .select("role, school_id, schools(name, slug)")
          .eq("user_id", user.id)
          .eq("is_active", true),
        supabase
          .from("profiles")
          .select("active_school_id")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const normalized: Membership[] = (members ?? []).map((m) => {
        const school = Array.isArray(m.schools) ? m.schools[0] : m.schools;
        return {
          role: m.role,
          schoolId: m.school_id,
          schoolName: school?.name ?? "School",
        };
      });

      setMemberships(normalized);

      const active = normalized.find(
        (m) => m.schoolId === profile?.active_school_id
      );
      setCurrentSchoolId(active?.schoolId ?? normalized[0]?.schoolId ?? null);
    })().catch((err) => {
      console.error("[school-switcher] Failed to load memberships:", err);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // No memberships — nothing to show (users without schools never reach the
  // platform shell, but keep the component safe anyway).
  if (memberships.length === 0) return null;

  const current = memberships.find((m) => m.schoolId === currentSchoolId);

  const labelClassName =
    "flex h-9 max-w-[16rem] items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground";

  // Single-school user — static context label (nothing to switch).
  if (memberships.length === 1) {
    return (
      <div title={current?.schoolName} className={labelClassName}>
        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{current?.schoolName ?? "School"}</span>
      </div>
    );
  }

  async function switchTo(membership: Membership) {
    if (switching) return;
    setSwitching(membership.schoolId);
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
        setSwitching(null);
        return;
      }

      // Full page load so server components re-resolve the new school context.
      window.location.href = data.redirectTo;
    } catch {
      setError("Network error. Please try again.");
      setSwitching(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={current?.schoolName}
        className={`${labelClassName} transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20`}
      >
        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{current?.schoolName ?? "School"}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Switch school</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {error && (
          <p className="px-1.5 py-1.5 text-xs font-medium text-red-600">
            {error}
          </p>
        )}
        {memberships.map((m) => {
          const isCurrent = m.schoolId === currentSchoolId;
          const isSwitching = switching === m.schoolId;
          return (
            <DropdownMenuItem
              key={`${m.schoolId}-${m.role}`}
              closeOnClick={false}
              disabled={switching !== null}
              onClick={() => switchTo(m)}
              className="gap-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {m.schoolName}
                </p>
                <p className="truncate text-xs capitalize text-muted-foreground">
                  {ROLE_LABELS[m.role] ?? m.role}
                </p>
              </div>
              {isSwitching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : isCurrent ? (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}