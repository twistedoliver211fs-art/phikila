"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X, ArrowUp, ArrowDown } from "lucide-react";
import {
  getConflicts,
  removeConflict,
  type OfflineConflict,
} from "@/lib/db";

/**
 * Shows offline-sync conflicts and lets the user resolve each one:
 * keep the server value, or overwrite it with what's on this device.
 */
export function SyncConflicts() {
  const [conflicts, setConflicts] = useState<OfflineConflict[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setConflicts(await getConflicts());
  }, []);

  useEffect(() => {
    refresh();
    // Re-check when the tab becomes visible (sync may have run in background).
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(refresh, 15000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(interval);
    };
  }, [refresh]);

  const resolve = async (conflict: OfflineConflict, choice: "server" | "client") => {
    setResolving(conflict.id);
    try {
      const res = await fetch("/api/sync/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: conflict.table, choice, conflict: { client: conflict.client, server: conflict.server } }),
      });
      if (res.ok) {
        await removeConflict(conflict.id);
        await refresh();
      }
    } finally {
      setResolving(null);
    }
  };

  if (conflicts.length === 0) return null;

  const label = (c: OfflineConflict) => {
    if (c.table === "attendance") {
      return `Attendance on ${c.key.date} — status: server "${c.server.status}" vs yours "${c.client.status}"`;
    }
    return `Exam score — server ${c.server.score} vs yours ${c.client.score}`;
  };

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800">
          {conflicts.length} offline edit{conflicts.length === 1 ? "" : "s"} conflicted with newer changes
        </p>
      </div>
      <p className="mt-1 text-xs text-amber-700">
        The server already had newer values for these records. Choose which version to keep.
      </p>
      <ul className="mt-3 space-y-2">
        {conflicts.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2"
          >
            <span className="text-xs text-foreground">{label(c)}</span>
            <span className="flex items-center gap-2">
              <button
                onClick={() => resolve(c, "server")}
                disabled={resolving === c.id}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                <ArrowDown className="h-3 w-3" />
                Keep server
              </button>
              <button
                onClick={() => resolve(c, "client")}
                disabled={resolving === c.id}
                className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                <ArrowUp className="h-3 w-3" />
                Use mine
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Compact count for the header — rendered next to the sync indicator. */
export function SyncConflictBadge() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    setCount(await (await import("@/lib/db")).getConflictCount());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      <AlertTriangle className="h-3 w-3" />
      {count} conflict{count === 1 ? "" : "s"}
    </span>
  );
}
