"use client";

import { useEffect, useState } from "react";
import { Save, Copy, RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Subject {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  name: string;
}

interface Term {
  id: string;
  name: string;
  is_current: boolean;
}

interface Period {
  id: string;
  position: number;
}

interface Break {
  id: string;
  days: number[];
}

interface SubjectFrequency {
  id?: string;
  subject_id: string;
  periods_per_week: number;
}

interface TeacherAssignment {
  subject_id: string;
  class_id: string;
  classes: { grade_id: string } | null;
}

export default function SubjectFrequenciesPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [previousTerm, setPreviousTerm] = useState<Term | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [frequencies, setFrequencies] = useState<SubjectFrequency[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [totalPeriods, setTotalPeriods] = useState(0);
  const [teachingPeriods, setTeachingPeriods] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

          const [subjectsRes, gradesRes, termsRes, periodsRes, breaksRes, teacherAssignRes] =
            await Promise.all([
              supabase.from("subjects").select("id, name").eq("school_id", sm.school_id),
              supabase.from("grades").select("id, name").eq("school_id", sm.school_id),
              supabase.from("terms").select("id, name, is_current, academic_years!inner(school_id)").eq("academic_years.school_id", sm.school_id),
              supabase.from("periods").select("id, position").eq("school_id", sm.school_id),
              supabase.from("breaks").select("id, days").eq("school_id", sm.school_id),
              supabase
                .from("teacher_subject_assignments")
                .select("subject_id, class_id, classes!inner(grade_id)")
                .eq("school_id", sm.school_id),
            ]);

          setSubjects(subjectsRes.data ?? []);
          setGrades(gradesRes.data ?? []);
          setTeacherAssignments((teacherAssignRes.data as unknown as TeacherAssignment[]) ?? []);

          const terms = termsRes.data ?? [];
          const active = terms.find((t) => t.is_current);
          const previous = terms
            .filter((t) => !t.is_current)
            .sort((a, b) => b.name.localeCompare(a.name))[0];

          setActiveTerm(active ?? null);
          setPreviousTerm(previous ?? null);

          if (active) {
            setSelectedGradeId(gradesRes.data?.[0]?.id ?? "");
          }

          const periods = periodsRes.data ?? [];
          const breaks = breaksRes.data ?? [];
          setTotalPeriods(periods.length);

          const teachingDays = new Set<number>();
          for (let day = 1; day <= 5; day++) {
            const isBreak = breaks.some((b) => b.days.includes(day));
            if (!isBreak) {
              teachingDays.add(day);
            }
          }
          setTeachingPeriods(periods.length * teachingDays.size);

          setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    if (!schoolId || !activeTerm || !selectedGradeId) return;

    const supabase = createClient();
    supabase
      .from("subject_frequencies")
      .select("id, subject_id, periods_per_week")
      .eq("school_id", schoolId)
      .eq("grade_id", selectedGradeId)
      .eq("term_id", activeTerm.id)
      .then(({ data }) => {
        setFrequencies(data ?? []);
      });
  }, [schoolId, activeTerm, selectedGradeId]);

  const getFrequency = (subjectId: string): number => {
    const freq = frequencies.find((f) => f.subject_id === subjectId);
    return freq?.periods_per_week ?? 0;
  };

  const updateFrequency = (subjectId: string, value: number) => {
    const clampedValue = Math.max(0, Math.min(10, value));
    setFrequencies((prev) => {
      const existing = prev.find((f) => f.subject_id === subjectId);
      if (existing) {
        return prev.map((f) =>
          f.subject_id === subjectId ? { ...f, periods_per_week: clampedValue } : f
        );
      }
      return [...prev, { subject_id: subjectId, periods_per_week: clampedValue }];
    });
  };

  const getStatus = (subjectId: string): "assigned" | "warning" | "missing" => {
    const freq = frequencies.find((f) => f.subject_id === subjectId);
    if (!freq || freq.periods_per_week === 0) return "missing";

    const hasTeacher = teacherAssignments.some(
      (ta) => ta.subject_id === subjectId && ta.classes?.grade_id === selectedGradeId
    );
    return hasTeacher ? "assigned" : "warning";
  };

  const totalAssigned = frequencies.reduce((sum, f) => sum + (f.periods_per_week > 0 ? f.periods_per_week : 0), 0);

  const handleSave = async () => {
    if (!schoolId || !activeTerm || !selectedGradeId) return;
    setSaving(true);
    const supabase = createClient();

    await supabase
      .from("subject_frequencies")
      .delete()
      .eq("school_id", schoolId)
      .eq("grade_id", selectedGradeId)
      .eq("term_id", activeTerm.id);

    const toInsert = frequencies
      .filter((f) => f.periods_per_week > 0)
      .map((f) => ({
        school_id: schoolId,
        subject_id: f.subject_id,
        grade_id: selectedGradeId,
        periods_per_week: f.periods_per_week,
        term_id: activeTerm.id,
      }));

    if (toInsert.length > 0) {
      await supabase.from("subject_frequencies").insert(toInsert);
    }

    setSaving(false);
  };

  const handleClone = async () => {
    if (!schoolId || !previousTerm || !selectedGradeId) return;
    const supabase = createClient();

    const { data } = await supabase
      .from("subject_frequencies")
      .select("subject_id, periods_per_week")
      .eq("school_id", schoolId)
      .eq("grade_id", selectedGradeId)
      .eq("term_id", previousTerm.id);

    if (data) {
      setFrequencies(data.map((f) => ({ subject_id: f.subject_id, periods_per_week: f.periods_per_week })));
    }
  };

  const handleStartFresh = () => {
    setFrequencies([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Subject Frequencies
            {activeTerm && (
              <span className="ml-2 text-lg font-normal text-muted-foreground">
                — {activeTerm.name}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Define how many periods per week each subject needs
          </p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-foreground mb-2">Grade</label>
          <select
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedGradeId && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            Total teaching periods this week:{" "}
            <span className="text-lg font-bold text-primary">{teachingPeriods}</span>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {previousTerm && (
          <Button variant="outline" size="sm" onClick={handleClone}>
            <Copy className="mr-2 h-4 w-4" />
            Clone from Previous Term
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleStartFresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Fresh
        </Button>
      </div>

      {selectedGradeId && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-left font-medium text-muted-foreground">Subject</th>
                  <th className="p-4 text-left font-medium text-muted-foreground w-32">
                    Periods/Week
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => {
                  const freq = getFrequency(subject.id);
                  const status = getStatus(subject.id);

                  return (
                    <tr
                      key={subject.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-medium text-foreground">{subject.name}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={freq}
                          onChange={(e) => updateFrequency(subject.id, parseInt(e.target.value) || 0)}
                          className="w-20 rounded border border-border bg-background px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="p-4">
                        {status === "assigned" && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Teacher assigned
                          </span>
                        )}
                        {status === "warning" && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-amber-600">
                            <AlertCircle className="h-4 w-4" />
                            No teacher assigned
                          </span>
                        )}
                        {status === "missing" && (
                          <span className="inline-flex items-center gap-1.5 text-sm text-red-600">
                            <XCircle className="h-4 w-4" />
                            No frequency set
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedGradeId && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-semibold text-foreground">{totalAssigned}</span>/{teachingPeriods}{" "}
            periods assigned
          </p>
        </div>
      )}
    </div>
  );
}
