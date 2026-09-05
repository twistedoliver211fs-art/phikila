"use client";

import { useState, useEffect, useCallback } from "react";
import { getSyncQueueCount } from "@/lib/db";
import { syncPendingData } from "@/lib/sync";

export function useSyncQueueCount() {
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const c = await getSyncQueueCount();
    setCount(c);
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    await syncPendingData();
    await refresh();
    setSyncing(false);
  }, [refresh]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const handleOnline = () => syncNow();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncNow]);

  return { count, syncing, syncNow, refresh };
}
