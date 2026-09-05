import {
  getSyncQueue,
  removeSyncQueueItem,
  getUnsyncedAttendance,
  markAttendanceSynced,
  getUnsyncedMarks,
  markMarksSynced,
} from "./db";

let isSyncing = false;

export async function syncPendingData(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  let synced = 0;
  let failed = 0;

  try {
    // Sync attendance
    const unsyncedAttendance = await getUnsyncedAttendance();
    if (unsyncedAttendance.length > 0) {
      try {
        const res = await fetch("/api/sync/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: unsyncedAttendance }),
        });
        if (res.ok) {
          await markAttendanceSynced(unsyncedAttendance.map((r) => r.id));
          synced += unsyncedAttendance.length;
        } else {
          failed += unsyncedAttendance.length;
        }
      } catch {
        failed += unsyncedAttendance.length;
      }
    }

    // Sync marks
    const unsyncedMarks = await getUnsyncedMarks();
    if (unsyncedMarks.length > 0) {
      try {
        const res = await fetch("/api/sync/marks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: unsyncedMarks }),
        });
        if (res.ok) {
          await markMarksSynced(unsyncedMarks.map((r) => r.id));
          synced += unsyncedMarks.length;
        } else {
          failed += unsyncedMarks.length;
        }
      } catch {
        failed += unsyncedMarks.length;
      }
    }

    // Process sync queue
    const queue = await getSyncQueue();
    for (const item of queue) {
      try {
        const res = await fetch(`/api/sync/${item.table}`, {
          method: item.operation === "delete" ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.data),
        });
        if (res.ok) {
          await removeSyncQueueItem(item.id);
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

export function startBackgroundSync() {
  if (typeof window === "undefined") return;

  // Sync when coming online
  window.addEventListener("online", () => {
    console.log("[sync] Back online, syncing pending data...");
    syncPendingData();
  });

  // Periodic sync every 30 seconds when online
  setInterval(() => {
    if (navigator.onLine) {
      syncPendingData();
    }
  }, 30000);
}
