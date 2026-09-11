"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Webhook, Plus, Trash2, Activity, CheckCircle, XCircle } from "lucide-react";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  failureCount: number;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  eventType: string;
  status: string;
  responseStatus: number | null;
  attempts: number;
  deliveredAt: string | null;
  createdAt: string;
}

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEndpoints() {
      try {
        const res = await fetch("/api/webhooks");
        if (res.ok) {
          const data = await res.json();
          setEndpoints(data.endpoints ?? []);
        }
      } catch {
        console.error("Failed to fetch webhooks");
      } finally {
        setLoading(false);
      }
    }
    fetchEndpoints();
  }, []);

  useEffect(() => {
    if (!selectedEndpoint) return;
    async function fetchDeliveries() {
      try {
        const res = await fetch(`/api/webhooks?endpointId=${selectedEndpoint}`);
        if (res.ok) {
          const data = await res.json();
          setDeliveries(data.deliveries ?? []);
        }
      } catch {
        console.error("Failed to fetch deliveries");
      }
    }
    fetchDeliveries();
  }, [selectedEndpoint]);

  async function handleCreateEndpoint() {
    const url = prompt("Enter webhook URL:");
    if (!url) return;

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events: ["*"] }),
      });

      if (res.ok) {
        const data = await res.json();
        setEndpoints((prev) => [data.endpoint, ...prev]);
      }
    } catch {
      console.error("Failed to create webhook");
    }
  }

  async function handleDeleteEndpoint(endpointId: string) {
    if (!confirm("Delete this webhook endpoint?")) return;

    try {
      await fetch("/api/webhooks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointId }),
      });
      setEndpoints((prev) => prev.filter((e) => e.id !== endpointId));
      if (selectedEndpoint === endpointId) setSelectedEndpoint(null);
    } catch {
      console.error("Failed to delete webhook");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Manage webhook endpoints and delivery logs</p>
        </div>
        <Button onClick={handleCreateEndpoint}>
          <Plus className="h-4 w-4 mr-2" />
          Add Endpoint
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-medium">Endpoints</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : endpoints.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No webhooks configured</p>
              </CardContent>
            </Card>
          ) : (
            endpoints.map((endpoint) => (
              <Card
                key={endpoint.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedEndpoint === endpoint.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedEndpoint(endpoint.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{endpoint.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {endpoint.events.length} events
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEndpoint(endpoint.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-medium mb-4">Delivery Log</h2>
          <Card>
            <CardContent className="p-0">
              {!selectedEndpoint ? (
                <p className="p-4 text-muted-foreground">Select an endpoint to view deliveries</p>
              ) : deliveries.length === 0 ? (
                <p className="p-4 text-muted-foreground">No deliveries yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Event</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Response</th>
                        <th className="p-3 text-left font-medium">Attempts</th>
                        <th className="p-3 text-left font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((d) => (
                        <tr key={d.id} className="border-b last:border-b-0">
                          <td className="p-3">{d.eventType}</td>
                          <td className="p-3">
                            <Badge variant={d.status === "delivered" ? "default" : "destructive"}>
                              {d.status === "delivered" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {d.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {d.responseStatus ?? "-"}
                          </td>
                          <td className="p-3">{d.attempts}</td>
                          <td className="p-3 text-muted-foreground">
                            {d.deliveredAt ? new Date(d.deliveredAt).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
