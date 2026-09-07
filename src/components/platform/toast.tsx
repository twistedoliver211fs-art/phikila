"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle } from "lucide-react";

let toastId = 0;
let listeners: ((toast: Toast | null) => void)[] = [];
let currentToast: Toast | null = null;

interface Toast {
  id: number;
  message: string;
}

export function toast(message: string) {
  currentToast = { id: ++toastId, message };
  listeners.forEach((l) => l(currentToast));
  setTimeout(() => {
    if (currentToast?.id === toastId) {
      currentToast = null;
      listeners.forEach((l) => l(null));
    }
  }, 3000);
}

export function Toaster() {
  const [t, setT] = useState<Toast | null>(null);

  useEffect(() => {
    listeners.push(setT);
    return () => {
      listeners = listeners.filter((l) => l !== setT);
    };
  }, []);

  if (!t) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-lg animate-in slide-in-from-bottom-2">
      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
      <span className="text-sm font-medium">{t.message}</span>
      <button
        onClick={() => {
          currentToast = null;
          setT(null);
        }}
        className="ml-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
