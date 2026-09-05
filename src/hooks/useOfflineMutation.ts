"use client";

import { useState, useCallback } from "react";
import { saveAttendance, saveMark, type OfflineAttendance, type OfflineMark } from "@/lib/db";

export function useOfflineMutation() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const mutateAttendance = useCallback(async (record: OfflineAttendance) => {
    setPending((p) => p + 1);
    try {
      await saveAttendance(record);
      return { success: true, offline: !navigator.onLine };
    } catch (err) {
      console.error("[offline] Failed to save attendance:", err);
      return { success: false, offline: !navigator.onLine };
    } finally {
      setPending((p) => p - 1);
    }
  }, []);

  const mutateMark = useCallback(async (record: OfflineMark) => {
    setPending((p) => p + 1);
    try {
      await saveMark(record);
      return { success: true, offline: !navigator.onLine };
    } catch (err) {
      console.error("[offline] Failed to save mark:", err);
      return { success: false, offline: !navigator.onLine };
    } finally {
      setPending((p) => p - 1);
    }
  }, []);

  return { pending, syncing, mutateAttendance, mutateMark };
}
