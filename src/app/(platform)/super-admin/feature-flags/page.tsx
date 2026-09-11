"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Plus, ToggleLeft, ToggleRight } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  scope: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const res = await fetch("/api/features");
        if (res.ok) {
          const data = await res.json();
          setFlags(data.flags ?? []);
        }
      } catch {
        console.error("Failed to fetch feature flags");
      } finally {
        setLoading(false);
      }
    }
    fetchFlags();
  }, []);

  async function toggleFlag(flagId: string, currentEnabled: boolean) {
    try {
      await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId, isEnabled: !currentEnabled }),
      });
      setFlags((prev) =>
        prev.map((f) =>
          f.id === flagId ? { ...f, isEnabled: !currentEnabled } : f
        )
      );
    } catch {
      console.error("Failed to toggle flag");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">Toggle platform features on and off</p>
        </div>
        <Flag className="h-5 w-5 text-muted-foreground" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : flags.length === 0 ? (
            <p className="p-4 text-muted-foreground">No feature flags configured</p>
          ) : (
            <div className="divide-y">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{flag.name}</p>
                      <Badge variant="outline">{flag.key}</Badge>
                      <Badge variant={flag.isEnabled ? "default" : "secondary"}>
                        {flag.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {flag.description && (
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(flag.id, flag.isEnabled)}
                  >
                    {flag.isEnabled ? (
                      <ToggleRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
