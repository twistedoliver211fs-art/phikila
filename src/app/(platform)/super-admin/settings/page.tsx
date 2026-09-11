"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Save } from "lucide-react";

interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  category: string;
  isPublic: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/platform?view=settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings ?? []);
        }
      } catch {
        console.error("Failed to fetch settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave(key: string, value: unknown) {
    setSaving(true);
    try {
      await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
    } catch {
      console.error("Failed to save setting");
    } finally {
      setSaving(false);
    }
  }

  const categories = [...new Set(settings.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
        </div>
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings
                .filter((s) => s.category === category)
                .map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{setting.key}</p>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={setting.isPublic ? "default" : "secondary"}>
                        {setting.isPublic ? "Public" : "Private"}
                      </Badge>
                      <span className="text-sm font-mono">
                        {typeof setting.value === "string"
                          ? setting.value
                          : JSON.stringify(setting.value)}
                      </span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
