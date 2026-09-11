"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";

interface NotificationPreference {
  channel: string;
  eventType: string;
  isEnabled: boolean;
}

const eventLabels: Record<string, string> = {
  "student.enrolled": "Student Enrolled",
  "invoice.created": "Invoice Created",
  "payment.received": "Payment Received",
  "report.card.ready": "Report Card Ready",
  "announcement.new": "New Announcement",
  "message.received": "Message Received",
  "exam.results": "Exam Results",
  "attendance.alert": "Attendance Alert",
  "fee.reminder": "Fee Reminder",
};

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const res = await fetch("/api/notifications/preferences");
        if (res.ok) {
          const data = await res.json();
          setPreferences(data.preferences ?? []);
        }
      } catch {
        console.error("Failed to fetch preferences");
      } finally {
        setLoading(false);
      }
    }
    fetchPreferences();
  }, []);

  async function togglePreference(channel: string, eventType: string, enabled: boolean) {
    setPreferences((prev) =>
      prev.map((p) =>
        p.channel === channel && p.eventType === eventType ? { ...p, isEnabled: enabled } : p
      )
    );

    try {
      await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, eventType, isEnabled: enabled }),
      });
    } catch {
      setPreferences((prev) =>
        prev.map((p) =>
          p.channel === channel && p.eventType === eventType ? { ...p, isEnabled: !enabled } : p
        )
      );
    }
  }

  const channels = ["in_app", "email"];
  const eventTypes = Object.keys(eventLabels);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground">Control how you receive notifications</p>
        </div>
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-6">
              {channels.map((channel) => (
                <div key={channel} className="space-y-3">
                  <h3 className="font-medium capitalize">
                    {channel === "in_app" ? "In-App Notifications" : "Email Notifications"}
                  </h3>
                  <div className="space-y-2">
                    {eventTypes.map((eventType) => {
                      const pref = preferences.find(
                        (p) => p.channel === channel && p.eventType === eventType
                      );
                      return (
                        <div
                          key={`${channel}-${eventType}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                          <span className="text-sm">{eventLabels[eventType]}</span>
                          <Button
                            variant={pref?.isEnabled ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              togglePreference(channel, eventType, !(pref?.isEnabled ?? true))
                            }
                          >
                            {pref?.isEnabled ?? true ? "On" : "Off"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
