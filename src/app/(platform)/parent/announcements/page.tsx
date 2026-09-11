"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  createdAt: string;
  authorName: string;
}

export default function ParentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/parent/announcements");
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements ?? []);
        }
      } catch {
        console.error("Failed to fetch announcements");
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">Latest news from your school</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const isExpanded = expandedId === a.id;
            const preview = a.content.length > 150 ? a.content.slice(0, 150) + "..." : a.content;
            return (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : a.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-foreground">{a.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {isExpanded ? a.content : preview}
                    </p>
                    {a.content.length > 150 && (
                      <button className="text-xs text-primary font-medium mt-1 hover:underline">
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-muted-foreground/60">
                        {a.authorName} — {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium capitalize">
                        {a.targetAudience}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
