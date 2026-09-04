"use client";

import { useEffect, useState } from "react";
import { Save, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_PALETTE = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#3b82f6",
  "#84cc16",
  "#f97316",
];

interface Subject {
  id: string;
  name: string;
}

interface SubjectColor {
  subject_id: string;
  color: string;
}

export default function TimetableSettingsPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [motto, setMotto] = useState("");
  const [note, setNote] = useState("");
  const [autoAssignColors, setAutoAssignColors] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single()
        .then(async ({ data: sm }) => {
          if (!sm) return;
          setSchoolId(sm.school_id);

          const [settingsRes, subjectsRes, colorsRes] = await Promise.all([
            supabase
              .from("timetable_settings")
              .select("school_motto, note, auto_assign_colors")
              .eq("school_id", sm.school_id)
              .single(),
            supabase
              .from("subjects")
              .select("id, name")
              .eq("school_id", sm.school_id)
              .order("name"),
            supabase
              .from("subject_colors")
              .select("subject_id, color")
              .eq("school_id", sm.school_id),
          ]);

          if (settingsRes.data) {
            setMotto(settingsRes.data.school_motto ?? "");
            setNote(settingsRes.data.note ?? "");
            setAutoAssignColors(settingsRes.data.auto_assign_colors ?? true);
          }

          setSubjects(subjectsRes.data ?? []);

          const colorMap: Record<string, string> = {};
          (colorsRes.data ?? []).forEach((c: SubjectColor) => {
            colorMap[c.subject_id] = c.color;
          });
          setSubjectColors(colorMap);

          setLoading(false);
        });
    });
  }, []);

  const getColor = (subjectId: string): string => {
    if (subjectColors[subjectId]) return subjectColors[subjectId];
    if (autoAssignColors) {
      const idx = subjects.findIndex((s) => s.id === subjectId);
      return DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
    }
    return "#6366f1";
  };

  const updateSubjectColor = (subjectId: string, color: string) => {
    setSubjectColors((prev) => ({ ...prev, [subjectId]: color }));
  };

  const resetToDefaults = () => {
    const fresh: Record<string, string> = {};
    subjects.forEach((s, i) => {
      fresh[s.id] = DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    });
    setSubjectColors(fresh);
  };

  const handleSave = async () => {
    if (!schoolId) return;
    setSaving(true);
    const supabase = createClient();

    await supabase.from("timetable_settings").upsert(
      {
        school_id: schoolId,
        school_motto: motto || null,
        note: note || null,
        auto_assign_colors: autoAssignColors,
      },
      { onConflict: "school_id" }
    );

    const colorEntries = subjects.map((s) => ({
      school_id: schoolId,
      subject_id: s.id,
      color: getColor(s.id),
    }));

    if (colorEntries.length > 0) {
      await supabase.from("subject_colors").delete().eq("school_id", schoolId);
      await supabase.from("subject_colors").insert(colorEntries);
    }

    setSaving(false);
    alert("Settings saved!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure printed timetable appearance and subject colors
          </p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || loading}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <>
          {/* School Motto */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <label className="text-sm font-medium text-foreground">School Motto</label>
            <p className="text-xs text-muted-foreground">
              Appears at the top of printed timetables
            </p>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="e.g. Knowledge is Power"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Note / Verse */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <label className="text-sm font-medium text-foreground">Note / Verse / Info</label>
            <p className="text-xs text-muted-foreground">
              Appears at the bottom of printed timetables (e.g. a Bible verse, school rule, or note)
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Proverbs 4:7 - Wisdom is the principal thing; therefore get wisdom..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Subject Colors */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Subject Colors</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAssignColors}
                    onChange={(e) => setAutoAssignColors(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  Auto-Assign Colors
                </label>
                <Button variant="ghost" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset to Defaults
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left font-medium text-muted-foreground">Subject</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Color</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Hex</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        No subjects found. Add subjects first.
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject) => {
                      const color = getColor(subject.id);
                      return (
                        <tr
                          key={subject.id}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-4 w-4 rounded-full shrink-0 border border-border/50"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-medium text-foreground">{subject.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => updateSubjectColor(subject.id, e.target.value)}
                                className="h-8 w-8 rounded border border-border cursor-pointer p-0 bg-transparent"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                                  updateSubjectColor(subject.id, val);
                                }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value;
                                if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
                                  updateSubjectColor(subject.id, color);
                                }
                              }}
                              className="w-24 rounded border border-border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
