"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationCenter() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Notifications
        </h3>
        <Button variant="ghost" size="sm" className="text-xs">
          Mark all read
        </Button>
      </div>
      <div className="space-y-3">
        {[
          {
            title: "Staff meeting reminder",
            time: "2 hours ago",
            unread: true,
          },
          {
            title: "New student enrollment request",
            time: "4 hours ago",
            unread: true,
          },
          {
            title: "Fee payment received",
            time: "Yesterday",
            unread: false,
          },
        ].map((notification) => (
          <div
            key={notification.title}
            className="flex items-start gap-3 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div
              className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                notification.unread ? "bg-primary" : "bg-transparent"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notification.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
