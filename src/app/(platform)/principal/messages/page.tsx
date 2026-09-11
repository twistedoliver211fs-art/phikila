"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Mail, Send, Search, Plus, Reply, X, ArrowLeft, Trash2 } from "lucide-react";

interface Message {
  id: string;
  senderId: string | null;
  recipientId: string | null;
  conversationId: string | null;
  subject: string | null;
  content: string;
  readAt: string | null;
  sentAt: string;
}

interface StaffMember {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface ComposeData {
  recipientId: string;
  subject: string;
  content: string;
  conversationId?: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState<ComposeData>({
    recipientId: "",
    subject: "",
    content: "",
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff ?? []);
      }
    } catch {
      console.error("Failed to fetch staff");
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    } catch {
      console.error("Failed to fetch current user");
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchStaff();
    fetchCurrentUser();
  }, [fetchMessages, fetchStaff, fetchCurrentUser]);

  useEffect(() => {
    if (selectedMessage && currentUserId && !selectedMessage.readAt && selectedMessage.recipientId === currentUserId) {
      fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: selectedMessage.id }),
      }).then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id ? { ...m, readAt: new Date().toISOString() } : m
          )
        );
        setSelectedMessage((prev) =>
          prev ? { ...prev, readAt: new Date().toISOString() } : prev
        );
      });
    }
  }, [selectedMessage, currentUserId]);

  const filtered = messages.filter((m) => {
    const matchesTab =
      activeTab === "inbox" ? m.recipientId === currentUserId : m.senderId === currentUserId;
    const matchesSearch =
      (m.subject?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = messages.filter(
    (m) => !m.readAt && m.recipientId === currentUserId
  ).length;

  const handleSend = async () => {
    if (!composeData.recipientId || !composeData.content) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeData),
      });
      if (res.ok) {
        setComposeOpen(false);
        setComposeData({ recipientId: "", subject: "", content: "" });
        setSuccess("Message sent successfully");
        await fetchMessages();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleReply = (msg: Message) => {
    setComposeData({
      recipientId: msg.senderId ?? "",
      subject: msg.subject?.startsWith("Re: ") ? msg.subject : `Re: ${msg.subject || "No subject"}`,
      content: "",
      conversationId: msg.conversationId ?? undefined,
    });
    setSelectedMessage(null);
    setComposeOpen(true);
  };

  const handleCompose = () => {
    setComposeData({ recipientId: "", subject: "", content: "" });
    setComposeOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        <Button onClick={handleCompose}>
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {composeOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Compose Message</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setComposeOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">To</label>
              <select
                value={composeData.recipientId}
                onChange={(e) =>
                  setComposeData((prev) => ({ ...prev, recipientId: e.target.value }))
                }
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select recipient...</option>
                {staff.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <input
                type="text"
                value={composeData.subject}
                onChange={(e) =>
                  setComposeData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Optional subject"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <textarea
                value={composeData.content}
                onChange={(e) =>
                  setComposeData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Type your message..."
                rows={5}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !composeData.recipientId || !composeData.content}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === "inbox" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("inbox")}
        >
          <Mail className="h-4 w-4 mr-1" />
          Inbox
        </Button>
        <Button
          variant={activeTab === "sent" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("sent")}
        >
          <Send className="h-4 w-4 mr-1" />
          Sent
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          {loading ? (
            <p className="text-muted-foreground p-4">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground p-4">No messages found.</p>
          ) : (
            filtered.map((msg) => (
              <Card
                key={msg.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedMessage?.id === msg.id ? "ring-2 ring-primary" : ""
                } ${
                  !msg.readAt && msg.recipientId === currentUserId
                    ? "border-l-4 border-l-primary"
                    : ""
                }`}
                onClick={() => setSelectedMessage(msg)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm truncate">
                      {msg.subject || "No subject"}
                    </p>
                    {!msg.readAt && msg.recipientId === currentUserId && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {msg.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.sentAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedMessage.subject || "No subject"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(selectedMessage.sentAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                {selectedMessage.recipientId === currentUserId && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => handleReply(selectedMessage)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to read</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
