"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Layers,
  BookOpen,
  Clock,
  Wallet,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SetupState {
  hasAcademicYear: boolean;
  hasGrades: boolean;
  hasSubjects: boolean;
  hasPeriods: boolean;
  hasFees: boolean;
}

interface TermRow {
  name: string;
  startDate: string;
  endDate: string;
}
interface ClassRow {
  name: string;
  stream: string;
  capacity: number;
}
interface GradeRow {
  name: string;
  level: number | "";
  classes: ClassRow[];
}
interface SubjectRow {
  name: string;
  code: string;
}
interface PeriodRow {
  name: string;
  startTime: string;
  endTime: string;
}
interface FeeRow {
  name: string;
  amount: number | "";
}

const STEPS = [
  { key: "academic-year", label: "Academic Year", icon: CalendarDays },
  { key: "grades-classes", label: "Grades & Classes", icon: Layers },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "periods", label: "Periods", icon: Clock },
  { key: "fees", label: "Fee Structures", icon: Wallet },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function isDone(step: StepKey, s: SetupState): boolean {
  switch (step) {
    case "academic-year": return s.hasAcademicYear;
    case "grades-classes": return s.hasGrades;
    case "subjects": return s.hasSubjects;
    case "periods": return s.hasPeriods;
    case "fees": return s.hasFees;
  }
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

async function postStep(body: Record<string, unknown>) {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Step failed");
  return data;
}

export function OnboardingWizard({
  schoolName,
  educationLevel,
  state: initialState,
}: {
  schoolName: string;
  educationLevel: string;
  state: SetupState;
}) {
  const router = useRouter();
  const [state, setState] = useState<SetupState>(initialState);
  const [active, setActive] = useState<StepKey>(
    (STEPS.find((s) => !isDone(s.key, initialState))?.key ?? "academic-year")
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [yearName, setYearName] = useState(`${new Date().getFullYear()}`);
  const [yearStart, setYearStart] = useState(`${new Date().getFullYear()}-01-06`);
  const [yearEnd, setYearEnd] = useState(`${new Date().getFullYear()}-11-06`);
  const [terms, setTerms] = useState<TermRow[]>([
    { name: "Term 1", startDate: "", endDate: "" },
    { name: "Term 2", startDate: "", endDate: "" },
    { name: "Term 3", startDate: "", endDate: "" },
  ]);

  // Step 2 state
  const [grades, setGrades] = useState<GradeRow[]>([
    { name: "", level: "", classes: [{ name: "", stream: "", capacity: 40 }] },
  ]);

  // Step 3 state
  const [subjectMode, setSubjectMode] = useState<"cbc" | "manual">("cbc");
  const [manualSubjects, setManualSubjects] = useState<SubjectRow[]>([{ name: "", code: "" }]);

  // Step 4 state
  const [periods, setPeriods] = useState<PeriodRow[]>([
    { name: "Period 1", startTime: "08:00", endTime: "08:40" },
  ]);

  // Step 5 state
  const [fees, setFees] = useState<FeeRow[]>([{ name: "", amount: "" }]);

  const [finishing, setFinishing] = useState(false);

  const save = async (key: StepKey) => {
    setSaving(true);
    setError(null);
    /** Optimistically-updated state for next-step selection within this call. */
    const patch: Partial<Record<keyof SetupState, boolean>> = {};
    try {
      if (key === "academic-year") {
        await postStep({
          step: key,
          yearName,
          startDate: yearStart,
          endDate: yearEnd,
          terms: terms.filter((t) => t.startDate && t.endDate),
        });
        patch.hasAcademicYear = true;
      } else if (key === "grades-classes") {
        await postStep({
          step: key,
          grades: grades
            .filter((g) => g.name.trim())
            .map((g) => ({ ...g, level: g.level === "" ? null : g.level, classes: g.classes.filter((c) => c.name.trim()) })),
        });
        patch.hasGrades = true;
      } else if (key === "subjects") {
        await postStep({
          step: key,
          mode: subjectMode,
          subjects: subjectMode === "manual" ? manualSubjects.filter((s) => s.name.trim()) : [],
        });
        patch.hasSubjects = true;
      } else if (key === "periods") {
        await postStep({ step: key, periods: periods.filter((p) => p.startTime && p.endTime) });
        patch.hasPeriods = true;
      } else if (key === "fees") {
        await postStep({
          step: key,
          structures: fees.filter((f) => f.name.trim() && Number(f.amount) > 0)
            .map((f) => ({ name: f.name, amount: Number(f.amount) })),
        });
        patch.hasFees = true;
      }
      const nextState = { ...state, ...patch };
      setState(nextState);
      const next = STEPS.find((s) => !isDone(s.key, nextState));
      setActive(next?.key ?? active);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setFinishing(true);
    setError(null);
    try {
      await postStep({ step: "complete" });
      router.push("/principal");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setFinishing(false);
    }
  };

  const doneCount = STEPS.filter((s) => isDone(s.key, state)).length;
  const allCoreDone = isDone("academic-year", state) && isDone("grades-classes", state);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Set up {schoolName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the academic structure before staff and students start using Decimal.
          {doneCount > 0 && ` ${doneCount} of ${STEPS.length} steps complete.`}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STEPS.map((s) => {
          const done = isDone(s.key, state);
          return (
            <li key={s.key}>
              <button
                onClick={() => setActive(s.key)}
                className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  active === s.key
                    ? "border-primary bg-primary/5 text-primary"
                    : done
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <s.icon className="h-3.5 w-3.5 shrink-0" />}
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-border bg-card p-6">
        {active === "academic-year" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Academic year & terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="text-xs font-medium text-muted-foreground">
                Year name
                <input className={`${inputCls} mt-1`} value={yearName} onChange={(e) => setYearName(e.target.value)} placeholder="2026" />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Start date
                <input type="date" className={`${inputCls} mt-1`} value={yearStart} onChange={(e) => setYearStart(e.target.value)} />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                End date
                <input type="date" className={`${inputCls} mt-1`} value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} />
              </label>
            </div>
            <div className="space-y-2">
              {terms.map((t, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <input className={inputCls} value={t.name} onChange={(e) => setTerms((ts) => ts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={`Term ${i + 1}`} />
                  <input type="date" className={inputCls} value={t.startDate} onChange={(e) => setTerms((ts) => ts.map((x, j) => (j === i ? { ...x, startDate: e.target.value } : x)))} />
                  <input type="date" className={inputCls} value={t.endDate} onChange={(e) => setTerms((ts) => ts.map((x, j) => (j === i ? { ...x, endDate: e.target.value } : x)))} />
                  <Button variant="ghost" size="sm" onClick={() => setTerms((ts) => ts.filter((_, j) => j !== i))} disabled={terms.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {terms.length < 4 && (
                <Button variant="outline" size="sm" onClick={() => setTerms((ts) => [...ts, { name: `Term ${ts.length + 1}`, startDate: "", endDate: "" }])}>
                  <Plus className="h-4 w-4 mr-1" /> Add term
                </Button>
              )}
            </div>
            <Button onClick={() => save("academic-year")} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isDone("academic-year", state) ? "Add another year" : "Save academic year"}
            </Button>
          </div>
        )}

        {active === "grades-classes" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Grades & classes</h2>
            {grades.map((g, gi) => (
              <div key={gi} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-end gap-2">
                  <label className="text-xs font-medium text-muted-foreground flex-1">
                    Grade name
                    <input className={`${inputCls} mt-1`} value={g.name} onChange={(e) => setGrades((gs) => gs.map((x, j) => (j === gi ? { ...x, name: e.target.value } : x)))} placeholder="Grade 7" />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground w-28">
                    Level
                    <input type="number" className={`${inputCls} mt-1`} value={g.level} onChange={(e) => setGrades((gs) => gs.map((x, j) => (j === gi ? { ...x, level: e.target.value === "" ? "" : Number(e.target.value) } : x)))} placeholder="7" />
                  </label>
                  <Button variant="ghost" size="icon" onClick={() => setGrades((gs) => gs.filter((_, j) => j !== gi))} disabled={grades.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {g.classes.map((c, ci) => (
                  <div key={ci} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end pl-4 border-l-2 border-muted">
                    <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
                      Class name
                      <input className={`${inputCls} mt-1`} value={c.name} onChange={(e) => setGrades((gs) => gs.map((x, j) => (j === gi ? { ...x, classes: x.classes.map((y, k) => (k === ci ? { ...y, name: e.target.value } : y)) } : x)))} placeholder="7 East" />
                    </label>
                    <label className="text-xs font-medium text-muted-foreground">
                      Stream
                      <input className={`${inputCls} mt-1`} value={c.stream} onChange={(e) => setGrades((gs) => gs.map((x, j) => (j === gi ? { ...x, classes: x.classes.map((y, k) => (k === ci ? { ...y, stream: e.target.value } : y)) } : x)))} placeholder="East" />
                    </label>
                    <label className="text-xs font-medium text-muted-foreground">
                      Capacity
                      <input type="number" className={`${inputCls} mt-1`} value={c.capacity} onChange={(e) => setGrades((gs) => gs.map((x, j) => (j === gi ? { ...x, classes: x.classes.map((y, k) => (k === ci ? { ...y, capacity: Number(e.target.value) } : y)) } : x)))} />
                    </label>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setGrades((gs) => gs.map((x, j) => (j === gi ? { ...x, classes: [...x.classes, { name: "", stream: "", capacity: 40 }] } : x)))}>
                  <Plus className="h-4 w-4 mr-1" /> Add class
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setGrades((gs) => [...gs, { name: "", level: "", classes: [{ name: "", stream: "", capacity: 40 }] }])}>
              <Plus className="h-4 w-4 mr-1" /> Add grade
            </Button>
            <div>
              <Button onClick={() => save("grades-classes")} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save grades & classes
              </Button>
            </div>
          </div>
        )}

        {active === "subjects" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Subjects</h2>
            <div className="flex gap-2">
              <Button variant={subjectMode === "cbc" ? "default" : "outline"} size="sm" onClick={() => setSubjectMode("cbc")}>
                Auto-load CBC ({educationLevel === "senior" ? "Senior School" : educationLevel === "junior" ? "Junior School" : "Junior + Senior"})
              </Button>
              <Button variant={subjectMode === "manual" ? "default" : "outline"} size="sm" onClick={() => setSubjectMode("manual")}>
                Enter manually
              </Button>
            </div>
            {subjectMode === "manual" && (
              <div className="space-y-2">
                {manualSubjects.map((s, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                    <input className={`${inputCls} sm:col-span-2`} value={s.name} onChange={(e) => setManualSubjects((ss) => ss.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Mathematics" />
                    <div className="flex gap-2">
                      <input className={inputCls} value={s.code} onChange={(e) => setManualSubjects((ss) => ss.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)))} placeholder="MAT" />
                      <Button variant="ghost" size="icon" onClick={() => setManualSubjects((ss) => ss.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setManualSubjects((ss) => [...ss, { name: "", code: "" }])}>
                  <Plus className="h-4 w-4 mr-1" /> Add subject
                </Button>
              </div>
            )}
            {subjectMode === "cbc" && (
              <p className="text-sm text-muted-foreground">
                Loads the full CBC subject list for your school&apos;s education level. You can edit subjects later.
              </p>
            )}
            <Button onClick={() => save("subjects")} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save subjects
            </Button>
          </div>
        )}

        {active === "periods" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Bell periods</h2>
            <div className="space-y-2">
              {periods.map((p, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <input className={inputCls} value={p.name} onChange={(e) => setPeriods((ps) => ps.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={`Period ${i + 1}`} />
                  <input type="time" className={inputCls} value={p.startTime} onChange={(e) => setPeriods((ps) => ps.map((x, j) => (j === i ? { ...x, startTime: e.target.value } : x)))} />
                  <input type="time" className={inputCls} value={p.endTime} onChange={(e) => setPeriods((ps) => ps.map((x, j) => (j === i ? { ...x, endTime: e.target.value } : x)))} />
                  <Button variant="ghost" size="icon" onClick={() => setPeriods((ps) => ps.filter((_, j) => j !== i))} disabled={periods.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPeriods((ps) => [...ps, { name: `Period ${ps.length + 1}`, startTime: "", endTime: "" }])}>
              <Plus className="h-4 w-4 mr-1" /> Add period
            </Button>
            <div>
              <Button onClick={() => save("periods")} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save periods
              </Button>
            </div>
          </div>
        )}

        {active === "fees" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Fee structures</h2>
            <div className="space-y-2">
              {fees.map((f, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <input className={`${inputCls} sm:col-span-2`} value={f.name} onChange={(e) => setFees((fs) => fs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Term 1 Tuition" />
                  <div className="flex gap-2">
                    <input type="number" className={inputCls} value={f.amount} onChange={(e) => setFees((fs) => fs.map((x, j) => (j === i ? { ...x, amount: e.target.value === "" ? "" : Number(e.target.value) } : x)))} placeholder="KES 12500" />
                    <Button variant="ghost" size="icon" onClick={() => setFees((fs) => fs.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setFees((fs) => [...fs, { name: "", amount: "" }])}>
              <Plus className="h-4 w-4 mr-1" /> Add fee
            </Button>
            <div>
              <Button onClick={() => save("fees")} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save fee structures
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {allCoreDone ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Core setup complete — the school can go live.
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" />
              Academic year and grades/classes are required before go-live.
            </>
          )}
        </div>
        <Button onClick={finish} disabled={!allCoreDone || finishing}>
          {finishing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Finish setup
        </Button>
      </div>
    </div>
  );
}
