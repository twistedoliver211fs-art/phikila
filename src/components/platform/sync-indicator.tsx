"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncQueueCount } from "@/hooks/useSyncQueueCount";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function SyncIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { count, syncing, syncNow } = useSyncQueueCount();

  if (isOnline && count === 0 && !wasOffline) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {!isOnline ? (
        <span className="flex items-center gap-1.5 text-amber-600">
          <WifiOff className="h-3.5 w-3.5" />
          Offline
        </span>
      ) : syncing ? (
        <span className="flex items-center gap-1.5 text-blue-600">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Syncing...
        </span>
      ) : count > 0 ? (
        <button
          onClick={syncNow}
          className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {count} pending
        </button>
      ) : wasOffline ? (
        <span className="flex items-center gap-1.5 text-green-600">
          <Wifi className="h-3.5 w-3.5" />
          Back online
        </span>
      ) : null}
    </div>
  );
}
