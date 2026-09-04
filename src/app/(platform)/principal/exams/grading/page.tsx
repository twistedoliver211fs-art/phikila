"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface GradeLevel {
  id: string;
  grade_label: string;
  min_score: number;
  max_score: number;
  description: string;
  position: number;
}

interface Term {
  id: string;
  name: string;
  is_active: boolean;
}

const DEFAULT_GRADES: Omit<GradeLevel, "id">[] = [
  { grade_label: "A", min_score: 70, max_score: 100, description: "Excellent", position: 1 },
  { grade_label: "B", min_score: 60, max_score: 69, description: "Very Good", position: 2 },
  { grade_label: "C", min_score: 50, max_score: 59, description: "Good", position: 3 },
  { grade_label: "D", min_score: 40, max_score: 49, description: "Satisfactory", position: 4 },
  { grade_label: "E", min_score: 0, max_score: 39, description: "Below Expectations", position: 5 },
];

export default function GradingSystemPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [term, setTerm] = useState<Term | null>(null);
  const [grades, setGrades] = useState<GradeLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("school_members").select("school_id").eq("user_id", user.id).eq("is_active", true).limit(1).single().then(async ({ data: sm }) => {
        if (!sm) return;
        setSchoolId(sm.school_id);

        const { data: termData } = await supabase
          .from("terms")
          .select("id, name, school_id, is_active")
          .eq("school_id", sm.school_id)
          .eq("is_active", true)
          .limit(1)
          .single();

        if (!termData) {
          setLoading(false);
          return;
        }
        setTerm(termData);

        const { data: existing } = await supabase
          .from("grading_systems")
          .select("*")
          .eq("school_id", sm.school_id)
          .eq("term_id", termData.id)
          .order("position", { ascending: true });

        if (existing && existing.length > 0) {
          setGrades(existing);
        } else {
          setGrades(DEFAULT_GRADES.map((g, i) => ({ ...g, id: `new-${i}` })));
        }
        setLoading(false);
      });
    });
  }, []);

  const validateGrades = (): string | null => {
    for (const g of grades) {
      if (g.min_score < 0 || g.min_score > 100) return `${g.grade_label}: Min must be 0–100`;
      if (g.max_score < 0 || g.max_score > 100) return `${g.grade_label}: Max must be 0–100`;
      if (g.min_score > g.max_score) return `${g.grade_label}: Min cannot exceed max`;
    }
    const sorted = [...grades].sort((a, b) => a.min_score - b.min_score);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].min_score <= sorted[i - 1].max_score) {
        return `Overlap detected between ${sorted[i - 1].grade_label} and ${sorted[i].grade_label}`;
      }
    }
    return null;
  };

  const updateGrade = (index: number, field: keyof GradeLevel, value: string | number) => {
    setGrades((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };

  const addGrade = () => {
    const nextLabel = String.fromCharCode(65 + grades.length);
    setGrades((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, grade_label: nextLabel, min_score: 0, max_score: 0, description: "", position: prev.length + 1 },
    ]);
  };

  const removeGrade = (index: number) => {
    setGrades((prev) => prev.filter((_, i) => i !== index).map((g, i) => ({ ...g, position: i + 1 })));
  };

  const resetToDefault = () => {
    setGrades(DEFAULT_GRADES.map((g, i) => ({ ...g, id: `new-${i}` })));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    const validationError = validateGrades();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!schoolId || !term) return;

    setSaving(true);
    const supabase = createClient();

    const { data: existingGrades } = await supabase
      .from("grading_systems")
      .select("id")
      .eq("school_id", schoolId)
      .eq("term_id", term.id);

    const existingIds = (existingGrades ?? []).map((g: { id: string }) => g.id);
    const currentIds = grades.filter((g) => !g.id.startsWith("new-")).map((g) => g.id);
    const idsToDelete = existingIds.filter((id) => !currentIds.includes(id));

    if (idsToDelete.length > 0) {
      await supabase.from("grading_systems").delete().in("id", idsToDelete);
    }

    const upserts = grades.map((g) => ({
      id: g.id.startsWith("new-") ? undefined : g.id,
      school_id: schoolId,
      term_id: term.id,
      grade_label: g.grade_label,
      min_score: g.min_score,
      max_score: g.max_score,
      description: g.description,
      position: g.position,
    }));

    const { error: upsertError } = await supabase.from("grading_systems").upsert(upserts, { onConflict: "school_id,term_id,grade_label" });
    if (upsertError) {
      setError("Failed to save grading system.");
      setSaving(false);
      return;
    }

    // Recalculate grades for all results in exams for this school
    const { data: schoolExams } = await supabase
      .from("exams")
      .select("id")
      .eq("school_id", schoolId);

    const examIds = schoolExams?.map((e) => e.id) ?? [];
    if (examIds.length === 0) {
      setSaving(false);
      setSuccess(true);
      return;
    }

    const { data: examResults } = await supabase
      .from("exam_results")
      .select("id, score")
      .in("exam_id", examIds);

    if (examResults && examResults.length > 0) {
      const recalcs = examResults.map((r: { id: string; score: number }) => {
        const matched = grades.find((g) => r.score >= g.min_score && r.score <= g.max_score);
        return { id: r.id, grade: matched?.grade_label ?? "—" };
      });
      await supabase.from("exam_results").upsert(recalcs, { onConflict: "exam_id,student_id,subject_id" });
    }

    const { data: members } = await supabase
      .from("school_members")
      .select("user_id, role")
      .eq("school_id", schoolId)
      .eq("is_active", true);

    if (members && members.length > 0) {
      const notifications = members.map((m: { user_id: string }) => ({
        user_id: m.user_id,
        title: "Grading System Updated",
        message: `The grading system for ${term.name} has been updated. All existing grades have been recalculated.`,
        read: false,
      }));
      await supabase.from("notifications").insert(notifications);
    }

    const { data: refreshed } = await supabase
      .from("grading_systems")
      .select("*")
      .eq("school_id", schoolId)
      .eq("term_id", term.id)
      .order("position", { ascending: true });

    if (refreshed) setGrades(refreshed);
    setSuccess(true);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grading System</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Grading System {term ? `— ${term.name}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure how scores map to grades. This affects all result calculations.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
          Grading system saved successfully. All grades have been recalculated and stakeholders notified.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground w-24">Grade</th>
                <th className="p-4 text-left font-medium text-muted-foreground w-24">Min %</th>
                <th className="p-4 text-left font-medium text-muted-foreground w-24">Max %</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Description</th>
                <th className="p-4 text-left font-medium text-muted-foreground w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={grade.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <input
                      type="text"
                      value={grade.grade_label}
                      onChange={(e) => updateGrade(index, "grade_label", e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={grade.min_score}
                      onChange={(e) => updateGrade(index, "min_score", Number(e.target.value))}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={grade.max_score}
                      onChange={(e) => updateGrade(index, "max_score", Number(e.target.value))}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={grade.description}
                      onChange={(e) => updateGrade(index, "description", e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeGrade(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <Button variant="outline" size="sm" onClick={addGrade}>
          <Plus className="mr-2 h-4 w-4" />
          Add Grade Level
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        Changing the grading system will recalculate all existing grades and notify teachers and parents.
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-amber-500 text-white hover:bg-amber-600">
          {saving ? "Saving..." : "Save & Notify All"}
        </Button>
        <Button variant="outline" onClick={resetToDefault}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
