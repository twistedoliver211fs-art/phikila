"use client";

import { useState } from "react";
import { Megaphone, MessageSquare, Calendar, FileText, X } from "lucide-react";

export function SecretaryQuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    { key: "announcement", icon: Megaphone, label: "New Announcement" },
    { key: "message", icon: MessageSquare, label: "Send Message" },
    { key: "event", icon: Calendar, label: "Schedule Event" },
    { key: "report", icon: FileText, label: "Generate Report" },
  ];

  const modalContent: Record<string, { title: string; description: string }> = {
    announcement: { title: "New Announcement", description: "Create and publish a school announcement to staff and parents." },
    message: { title: "Send Message", description: "Send a direct message to a staff member or parent." },
    event: { title: "Schedule Event", description: "Add an event to the school calendar." },
    report: { title: "Generate Report", description: "Generate an office or administrative report." },
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={() => setActiveModal(a.key)}
            className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <a.icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">{a.label}</span>
          </button>
        ))}
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{modalContent[activeModal]?.title}</h2>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {modalContent[activeModal]?.description}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This feature is coming soon.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
