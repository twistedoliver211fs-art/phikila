"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, X, Pencil, Trash2 } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  targetAudience: string;
  createdAt: string;
  authorName: string;
}

interface AnnouncementForm {
  title: string;
  content: string;
  isPublished: boolean;
  targetAudience: string;
}

export default function PrincipalAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>({
    title: "",
    content: "",
    isPublished: false,
    targetAudience: "all",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements ?? []);
      }
    } catch {
      console.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", content: "", isPublished: false, targetAudience: "all" });
    setFormOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      content: a.content,
      isPublished: a.isPublished,
      targetAudience: a.targetAudience,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const url = "/api/announcements";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setFormOpen(false);
        setSuccess(editingId ? "Announcement updated" : "Announcement created");
        await fetchAnnouncements();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      console.error("Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchAnnouncements();
      }
    } catch {
      console.error("Failed to delete announcement");
    }
  };

  const togglePublished = async (a: Announcement) => {
    try {
      const res = await fetch("/api/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, isPublished: !a.isPublished }),
      });
      if (res.ok) {
        await fetchAnnouncements();
      }
    } catch {
      console.error("Failed to update announcement");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">{announcements.length} announcements</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {formOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? "Edit Announcement" : "New Announcement"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setFormOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your announcement..."
                rows={5}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Target Audience</label>
                <select
                  value={form.targetAudience}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, targetAudience: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All</option>
                  <option value="teachers">Teachers</option>
                  <option value="parents">Parents</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <div className="flex items-center h-9 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      form.isPublished ? "bg-primary" : "bg-input"
                    }`}
                  >
                    <span
                      className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        form.isPublished ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {form.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.title || !form.content}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground p-4">Loading...</p>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No announcements yet.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold">{a.title}</h2>
                      <Badge
                        className={
                          a.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {a.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{a.targetAudience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {a.content}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {a.authorName} — {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublished(a)}
                      title={a.isPublished ? "Unpublish" : "Publish"}
                    >
                      <Megaphone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(a.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
