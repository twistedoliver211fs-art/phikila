"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    async function fetchKeys() {
      try {
        const res = await fetch("/api/api-keys");
        if (res.ok) {
          const data = await res.json();
          setApiKeys(data.apiKeys ?? []);
        }
      } catch {
        console.error("Failed to fetch API keys");
      } finally {
        setLoading(false);
      }
    }
    fetchKeys();
  }, []);

  async function handleCreateKey() {
    const name = prompt("Enter a name for this API key:");
    if (!name) return;

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.plainKey);
        setApiKeys((prev) => [data.apiKey, ...prev]);
      }
    } catch {
      console.error("Failed to create API key");
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key?")) return;

    try {
      await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKeyId: keyId }),
      });
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch {
      console.error("Failed to revoke API key");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Manage API keys for third-party integrations</p>
        </div>
        <Button onClick={handleCreateKey}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">API Key Created</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-green-700">
              Copy this key now. It will not be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                {showKey ? newKey : "••••••••••••••••••••••••••••••••"}
              </code>
              <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(newKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setNewKey(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : apiKeys.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Key</th>
                    <th className="p-3 text-left font-medium">Rate Limit</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Last Used</th>
                    <th className="p-3 text-left font-medium">Created</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{key.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">{key.keyPrefix}...</td>
                      <td className="p-3">{key.rateLimit}/hr</td>
                      <td className="p-3">
                        <Badge variant={key.isActive ? "default" : "secondary"}>
                          {key.isActive ? "Active" : "Revoked"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-3">{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        {key.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
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
  );
}
