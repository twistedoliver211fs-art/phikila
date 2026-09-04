"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Save,
  Trash2,
  Wand2,
  Copy,
  X,
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_NUMBERS = [1, 2, 3, 4, 5];

const CORE_SUBJECTS = ["Mathematics", "Math", "English", "Kiswahili"];
const AFTERNOON_SUBJECTS = ["Physical Education", "PE", "Art", "Creative Arts"];

const DEFAULT_COLORS: Record<string, string> = {
  Mathematics: "#6366f1",
  Math: "#6366f1",
  English: "#ec4899",
  Kiswahili: "#f59e0b",
  Science: "#10b981",
  "Social Studies": "#8b5cf6",
  "Physical Education": "#ef4444",
  PE: "#ef4444",
  Art: "#06b6d4",
  Computer: "#3b82f6",
};

interface Period {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  position: number;
}

interface Class {
  id: string;
  name: string;
  school_id: string;
  grades: { name: string }[];
}

interface Subject {
  id: string;
  name: string;
  school_id: string;
  required_room_type: string | null;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  school_id: string;
}

interface Room {
  id: string;
  name: string;
  school_id: string;
  room_type: string;
}

interface Term {
  id: string;
  name: string;
  school_id: string;
  is_active: boolean;
}

interface Break {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_type: string;
  days: number[];
  position: number;
}

interface TeacherSubjectAssignment {
  staff_id: string;
  subject_id: string;
  class_id: string;
  school_id: string;
}

interface SubjectFrequency {
  subject_id: string;
  grade_id: string;
  periods_per_week: number;
  school_id: string;
  term_id: string;
}

interface SubjectColor {
  subject_id: string;
  school_id: string;
  color: string;
}

interface TimetableSettings {
  school_id: string;
  school_motto: string | null;
  note: string | null;
}

interface TimetableSlot {
  id?: string;
  school_id: string;
  class_id: string;
  period_id: string;
  day_of_week: number;
  subject_id: string;
  staff_id: string;
  room_id: string;
  term_id: string;
}

interface ConflictInfo {
  type: "teacher" | "room";
  message: string;
}

interface CellKey {
  periodId: string;
  dayOfWeek: number;
}

export default function PrincipalTimetablePage() {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [subjectFrequencies, setSubjectFrequencies] = useState<SubjectFrequency[]>([]);
  const [subjectColors, setSubjectColors] = useState<SubjectColor[]>([]);
  const [allSlots, setAllSlots] = useState<TimetableSlot[]>([]);

  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [openCell, setOpenCell] = useState<CellKey | null>(null);

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

          const [
            termsRes,
            classesRes,
            periodsRes,
            subjectsRes,
            staffRes,
            roomsRes,
            breaksRes,
            assignmentsRes,
            frequenciesRes,
            colorsRes,
            slotsRes,
          ] = await Promise.all([
            supabase.from("terms").select("*").eq("school_id", sm.school_id).order("name"),
            supabase.from("classes").select("id, name, school_id, grades(name)").eq("school_id", sm.school_id),
            supabase.from("periods").select("*").eq("school_id", sm.school_id).order("position"),
            supabase.from("subjects").select("*").eq("school_id", sm.school_id),
            supabase.from("staff").select("id, first_name, last_name, school_id").eq("school_id", sm.school_id).eq("is_active", true),
            supabase.from("rooms").select("*").eq("school_id", sm.school_id),
            supabase.from("breaks").select("*").eq("school_id", sm.school_id),
            supabase.from("teacher_subject_assignments").select("*").eq("school_id", sm.school_id),
            supabase.from("subject_frequencies").select("*").eq("school_id", sm.school_id),
            supabase.from("subject_colors").select("*").eq("school_id", sm.school_id),
            supabase.from("timetable_slots").select("*").eq("school_id", sm.school_id),
          ]);

          setTerms(termsRes.data ?? []);
          setClasses(classesRes.data ?? []);
          setPeriods(periodsRes.data ?? []);
          setSubjects(subjectsRes.data ?? []);
          setStaff(staffRes.data ?? []);
          setRooms(roomsRes.data ?? []);
          setBreaks(breaksRes.data ?? []);
          setTeacherAssignments(assignmentsRes.data ?? []);
          setSubjectFrequencies(frequenciesRes.data ?? []);
          setSubjectColors(colorsRes.data ?? []);
          setAllSlots(slotsRes.data ?? []);

          const activeTerm = (termsRes.data ?? []).find((t) => t.is_active);
          if (activeTerm) {
            setSelectedTermId(activeTerm.id);
          } else if (termsRes.data?.length) {
            setSelectedTermId(termsRes.data[0].id);
          }

          setLoading(false);
        });
    });
  }, []);

  const loadClassSlots = useCallback(
    async (classId: string, termId: string) => {
      if (!schoolId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("timetable_slots")
        .select("*")
        .eq("school_id", schoolId)
        .eq("class_id", classId)
        .eq("term_id", termId);
      setAllSlots(data ?? []);
    },
    [schoolId]
  );

  useEffect(() => {
    if (selectedClassId && selectedTermId) {
      loadClassSlots(selectedClassId, selectedTermId);
    }
  }, [selectedClassId, selectedTermId, loadClassSlots]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? null,
    [classes, selectedClassId]
  );

  const selectedTerm = useMemo(
    () => terms.find((t) => t.id === selectedTermId) ?? null,
    [terms, selectedTermId]
  );

  const gradeId = selectedClass?.grades?.[0]?.name;

  const classSlots = useMemo(() => {
    return allSlots.filter(
      (s) => s.class_id === selectedClassId && s.term_id === selectedTermId
    );
  }, [allSlots, selectedClassId, selectedTermId]);

  const getSlot = useCallback(
    (periodId: string, dayOfWeek: number) =>
      classSlots.find((s) => s.period_id === periodId && s.day_of_week === dayOfWeek),
    [classSlots]
  );

  const getSubjectName = useCallback(
    (subjectId: string) => subjects.find((s) => s.id === subjectId)?.name ?? "",
    [subjects]
  );

  const getStaffName = useCallback(
    (staffId: string) => {
      const member = staff.find((s) => s.id === staffId);
      return member ? `${member.first_name} ${member.last_name}` : "";
    },
    [staff]
  );

  const getRoomName = useCallback(
    (roomId: string) => rooms.find((r) => r.id === roomId)?.name ?? "",
    [rooms]
  );

  const getSubjectColor = useCallback(
    (subjectId: string) => {
      const dbColor = subjectColors.find((sc) => sc.subject_id === subjectId);
      if (dbColor) return dbColor.color;
      const name = getSubjectName(subjectId);
      return DEFAULT_COLORS[name] ?? "#6b7280";
    },
    [subjectColors, getSubjectName]
  );

  const assignedSubjectsForClass = useMemo(() => {
    if (!selectedClassId) return [];
    const assignmentSubjectIds = teacherAssignments
      .filter((a) => a.class_id === selectedClassId)
      .map((a) => a.subject_id);
    return subjects.filter((s) => assignmentSubjectIds.includes(s.id));
  }, [teacherAssignments, subjects, selectedClassId]);

  const requiredAssignments = useMemo(() => {
    if (!selectedClassId || !selectedTermId || !gradeId) return [];
    const freqs = subjectFrequencies.filter(
      (f) => f.grade_id === gradeId && f.term_id === selectedTermId
    );
    const freqMap = new Map<string, number>();
    freqs.forEach((f) => freqMap.set(f.subject_id, f.periods_per_week));

    const result: { subject: Subject; count: number }[] = [];
    assignedSubjectsForClass.forEach((sub) => {
      const count = freqMap.get(sub.id) ?? 0;
      if (count > 0) {
        result.push({ subject: sub, count });
      }
    });
    return result;
  }, [subjectFrequencies, assignedSubjectsForClass, selectedClassId, selectedTermId, gradeId]);

  const conflicts = useMemo(() => {
    const conflictMap = new Map<string, ConflictInfo[]>();

    const classSlotLists = new Map<string, TimetableSlot[]>();
    allSlots.forEach((slot) => {
      const key = slot.class_id;
      if (!classSlotLists.has(key)) classSlotLists.set(key, []);
      classSlotLists.get(key)!.push(slot);
    });

    classSlotLists.forEach((slots, classId) => {
      if (classId === selectedClassId) return;

      slots.forEach((otherSlot) => {
        classSlots.forEach((mySlot) => {
          if (
            mySlot.period_id === otherSlot.period_id &&
            mySlot.day_of_week === otherSlot.day_of_week
          ) {
            const cellKey = `${mySlot.period_id}-${mySlot.day_of_week}`;
            if (!conflictMap.has(cellKey)) conflictMap.set(cellKey, []);

            if (mySlot.staff_id && mySlot.staff_id === otherSlot.staff_id) {
              const teacher = getStaffName(mySlot.staff_id);
              const otherClass = classes.find((c) => c.id === otherSlot.class_id);
              conflictMap.get(cellKey)!.push({
                type: "teacher",
                message: `${teacher} is assigned to ${otherClass?.name ?? "another class"} at this time`,
              });
            }

            if (mySlot.room_id && mySlot.room_id === otherSlot.room_id) {
              const room = getRoomName(mySlot.room_id);
              const otherClass = classes.find((c) => c.id === otherSlot.class_id);
              conflictMap.get(cellKey)!.push({
                type: "room",
                message: `${room} is used by ${otherClass?.name ?? "another class"} at this time`,
              });
            }
          }
        });
      });
    });

    return conflictMap;
  }, [allSlots, classSlots, selectedClassId, classes, getStaffName, getRoomName]);

  const teacherConflictCount = useMemo(() => {
    let count = 0;
    conflicts.forEach((infos) => {
      if (infos.some((i) => i.type === "teacher")) count++;
    });
    return count;
  }, [conflicts]);

  const roomConflictCount = useMemo(() => {
    let count = 0;
    conflicts.forEach((infos) => {
      if (infos.some((i) => i.type === "room")) count++;
    });
    return count;
  }, [conflicts]);

  const updateSlot = useCallback(
    (periodId: string, dayOfWeek: number, field: keyof TimetableSlot, value: string) => {
      setAllSlots((prev) => {
        const idx = prev.findIndex(
          (s) =>
            s.period_id === periodId &&
            s.day_of_week === dayOfWeek &&
            s.class_id === selectedClassId
        );
        const base = prev[idx] ?? {
          school_id: schoolId ?? "",
          class_id: selectedClassId,
          period_id: periodId,
          day_of_week: dayOfWeek,
          subject_id: "",
          staff_id: "",
          room_id: "",
          term_id: selectedTermId,
        };
        const updated = { ...base, [field]: value };

        if (field === "subject_id" && value) {
          const assignment = teacherAssignments.find(
            (a) => a.subject_id === value && a.class_id === selectedClassId
          );
          if (assignment) {
            updated.staff_id = assignment.staff_id;
            const subject = subjects.find((s) => s.id === value);
            if (subject?.required_room_type) {
              const availableRoom = rooms.find(
                (r) => r.room_type === subject.required_room_type
              );
              if (availableRoom) {
                updated.room_id = availableRoom.id;
              }
            }
          }
        }

        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    },
    [selectedClassId, selectedTermId, schoolId, teacherAssignments, subjects, rooms]
  );

  const removeSlot = useCallback(
    (periodId: string, dayOfWeek: number) => {
      setAllSlots((prev) =>
        prev.filter(
          (s) =>
            !(
              s.period_id === periodId &&
              s.day_of_week === dayOfWeek &&
              s.class_id === selectedClassId
            )
        )
      );
    },
    [selectedClassId]
  );

  const clearAll = useCallback(() => {
    setAllSlots((prev) =>
      prev.filter((s) => s.class_id !== selectedClassId || s.term_id !== selectedTermId)
    );
  }, [selectedClassId, selectedTermId]);

  const copyDayToAll = useCallback(
    (sourceDay: number) => {
      const sourceSlots = classSlots.filter((s) => s.day_of_week === sourceDay);
      setAllSlots((prev) => {
        let next = prev.filter(
          (s) =>
            s.class_id !== selectedClassId ||
            s.term_id !== selectedTermId ||
            DAY_NUMBERS.filter((d) => d !== sourceDay).includes(s.day_of_week)
        );

        DAY_NUMBERS.forEach((day) => {
          if (day === sourceDay) return;
          sourceSlots.forEach((src) => {
            next.push({
              ...src,
              id: undefined,
              day_of_week: day,
            });
          });
        });

        return next;
      });
    },
    [classSlots, selectedClassId, selectedTermId]
  );

  const isAvailable = useCallback(
    (
      periodId: string,
      dayOfWeek: number,
      subjectId: string,
      teacherId: string,
      roomId: string
    ): boolean => {
      for (const slot of allSlots) {
        if (
          slot.period_id === periodId &&
          slot.day_of_week === dayOfWeek &&
          slot.class_id !== selectedClassId
        ) {
          if (teacherId && slot.staff_id === teacherId) return false;
          if (roomId && slot.room_id === roomId) return false;
        }
      }
      return true;
    },
    [allSlots, selectedClassId]
  );

  const scoreSlot = useCallback(
    (periodId: string, dayOfWeek: number, subjectName: string): number => {
      let score = 0;
      const period = periods.find((p) => p.id === periodId);
      if (!period) return 0;

      const startHour = parseInt((period.start_time ?? "08:00").split(":")[0], 10);
      const isCore = CORE_SUBJECTS.some((cs) =>
        subjectName.toLowerCase().includes(cs.toLowerCase())
      );
      const isAfternoon = AFTERNOON_SUBJECTS.some((as) =>
        subjectName.toLowerCase().includes(as.toLowerCase())
      );

      if (isCore && startHour < 12) score += 10;
      if (isAfternoon && startHour >= 12) score += 10;

      const dayCount = classSlots.filter(
        (s) => s.day_of_week === dayOfWeek && s.subject_id
      ).length;
      score -= dayCount;

      return score;
    },
    [periods, classSlots]
  );

  const generateDraft = useCallback(async () => {
    if (!selectedClassId || !selectedTermId || !schoolId) return;
    setGenerating(true);

    const newSlots: TimetableSlot[] = [];
    const occupied = new Set<string>();

    const existing = allSlots.filter(
      (s) => s.class_id === selectedClassId && s.term_id === selectedTermId
    );
    existing.forEach((s) => {
      occupied.add(`${s.period_id}-${s.day_of_week}`);
    });

    for (const req of requiredAssignments) {
      let placed = 0;
      while (placed < req.count) {
        let bestSlot: CellKey | null = null;
        let bestScore = -Infinity;

        for (const period of periods) {
          for (const day of DAY_NUMBERS) {
            const key = `${period.id}-${day}`;
            if (occupied.has(key)) continue;

            if (
              !isAvailable(period.id, day, req.subject.id, "", "")
            ) {
              continue;
            }

            const score = scoreSlot(period.id, day, req.subject.name);
            if (score > bestScore) {
              bestScore = score;
              bestSlot = { periodId: period.id, dayOfWeek: day };
            }
          }
        }

        if (bestSlot) {
          const assignment = teacherAssignments.find(
            (a) => a.subject_id === req.subject.id && a.class_id === selectedClassId
          );
          const teacherId = assignment?.staff_id ?? "";
          let roomId = "";
          if (req.subject.required_room_type) {
            const room = rooms.find(
              (r) => r.room_type === req.subject.required_room_type
            );
            roomId = room?.id ?? "";
          }

          newSlots.push({
            school_id: schoolId,
            class_id: selectedClassId,
            period_id: bestSlot.periodId,
            day_of_week: bestSlot.dayOfWeek,
            subject_id: req.subject.id,
            staff_id: teacherId,
            room_id: roomId,
            term_id: selectedTermId,
          });
          occupied.add(`${bestSlot.periodId}-${bestSlot.dayOfWeek}`);
          placed++;
        } else {
          break;
        }
      }
    }

    setAllSlots((prev) => {
      const withoutCurrentClass = prev.filter(
        (s) => s.class_id !== selectedClassId || s.term_id !== selectedTermId
      );
      return [...withoutCurrentClass, ...newSlots];
    });

    setGenerating(false);
  }, [
    selectedClassId,
    selectedTermId,
    schoolId,
    requiredAssignments,
    periods,
    allSlots,
    teacherAssignments,
    rooms,
    isAvailable,
    scoreSlot,
  ]);

  const saveTimetable = useCallback(async () => {
    if (!schoolId || !selectedClassId || !selectedTermId) return;
    setSaving(true);
    const supabase = createClient();

    const toSave = classSlots.map((s) => ({
      school_id: schoolId,
      class_id: selectedClassId,
      period_id: s.period_id,
      day_of_week: s.day_of_week,
      subject_id: s.subject_id,
      staff_id: s.staff_id,
      room_id: s.room_id,
      term_id: selectedTermId,
    }));

    await supabase
      .from("timetable_slots")
      .delete()
      .eq("school_id", schoolId)
      .eq("class_id", selectedClassId)
      .eq("term_id", selectedTermId);

    if (toSave.length > 0) {
      await supabase.from("timetable_slots").insert(toSave);
    }

    setSaving(false);
  }, [schoolId, selectedClassId, selectedTermId, classSlots]);

  const buildGrid = useCallback(() => {
    const breakPositionMap = new Map<number, Break>();
    breaks.forEach((b) => {
      if (!b.days || b.days.length === 0 || b.days.some((d) => DAY_NUMBERS.includes(d))) {
        breakPositionMap.set(b.position, b);
      }
    });

    const sortedPeriods = [...periods].sort((a, b) => a.position - b.position);
    const rows: (
      | { type: "period"; period: Period }
      | { type: "break"; brk: Break }
    )[] = [];

    let lastPosition = 0;
    sortedPeriods.forEach((period) => {
      if (breakPositionMap.has(lastPosition)) {
        rows.push({ type: "break", brk: breakPositionMap.get(lastPosition)! });
      }
      rows.push({ type: "period", period });
      lastPosition = period.position;
    });
    if (breakPositionMap.has(lastPosition)) {
      rows.push({ type: "break", brk: breakPositionMap.get(lastPosition)! });
    }

    return rows;
  }, [periods, breaks]);

  const gridRows = useMemo(() => buildGrid(), [buildGrid]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable Builder</h1>
          <p className="text-muted-foreground mt-1">
            {selectedTerm ? selectedTerm.name : "Select a term"} — Build and manage the weekly class timetable
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            {teacherConflictCount} teacher
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
            {roomConflictCount} room
          </span>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground">Term</label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select term</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.grades?.[0]?.name ?? ""} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={generateDraft}
                disabled={!selectedClassId || !selectedTermId || generating}
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyDayToAll(1)}
                disabled={!selectedClassId}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Mon→All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearAll}
                disabled={!selectedClassId}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={saveTimetable}
                disabled={!selectedClassId || !selectedTermId || saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      {selectedClassId && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {assignedSubjectsForClass.map((sub) => (
            <span key={sub.id} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ backgroundColor: getSubjectColor(sub.id) }}
              />
              {sub.name}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading...
        </div>
      ) : !selectedClassId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a term and class to begin building the timetable.
          </CardContent>
        </Card>
      ) : periods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No periods configured. Ask your admin to set up periods first.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left font-medium text-muted-foreground w-28">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Time
                      </div>
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="p-3 text-center font-medium text-muted-foreground min-w-[140px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridRows.map((row, rowIdx) => {
                    if (row.type === "break") {
                      return (
                        <tr key={`break-${rowIdx}`}>
                          <td colSpan={6} className="p-0">
                            <div className="bg-muted/50 border-y border-border px-4 py-2 text-center">
                              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                                {row.brk.name}
                              </span>
                              <span className="text-xs text-muted-foreground/70 ml-2">
                                {row.brk.start_time?.slice(0, 5)} – {row.brk.end_time?.slice(0, 5)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    const period = row.period;

                    return (
                      <tr key={period.id} className="border-b border-border/50 last:border-0">
                        <td className="p-3 align-top">
                          <p className="font-medium text-foreground text-xs">{period.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {period.start_time?.slice(0, 5)} – {period.end_time?.slice(0, 5)}
                          </p>
                        </td>
                        {DAY_NUMBERS.map((dayNum) => {
                          const slot = getSlot(period.id, dayNum);
                          const cellKey = `${period.id}-${dayNum}`;
                          const cellConflicts = conflicts.get(cellKey) ?? [];
                          const hasTeacherConflict = cellConflicts.some(
                            (c) => c.type === "teacher"
                          );
                          const hasRoomConflict = cellConflicts.some(
                            (c) => c.type === "room"
                          );
                          const isOpen =
                            openCell?.periodId === period.id && openCell?.dayOfWeek === dayNum;

                          let borderColor = "border-transparent";
                          if (slot?.subject_id) {
                            if (hasTeacherConflict) borderColor = "border-red-500";
                            else if (hasRoomConflict) borderColor = "border-yellow-500";
                            else borderColor = "border-green-400";
                          }

                          const bgColor =
                            slot?.subject_id
                              ? getSubjectColor(slot.subject_id)
                              : undefined;

                          return (
                            <td
                              key={dayNum}
                              className={`p-1.5 align-top relative border-l-2 ${borderColor} ${
                                isOpen ? "bg-primary/5" : ""
                              }`}
                              style={
                                slot?.subject_id && bgColor
                                  ? { backgroundColor: `${bgColor}15` }
                                  : undefined
                              }
                            >
                              {slot?.subject_id ? (
                                <div className="group relative">
                                  <button
                                    onClick={() =>
                                      setOpenCell(
                                        isOpen ? null : { periodId: period.id, dayOfWeek: dayNum }
                                      )
                                    }
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      removeSlot(period.id, dayNum);
                                    }}
                                    className="w-full text-left rounded-md p-2 hover:bg-black/5 transition-colors min-h-[60px]"
                                  >
                                    <div
                                      className="absolute top-0 left-0 w-1 h-full rounded-l-md"
                                      style={{ backgroundColor: bgColor }}
                                    />
                                    <p
                                      className="text-xs font-semibold leading-tight pl-1.5"
                                      style={{ color: bgColor }}
                                    >
                                      {getSubjectName(slot.subject_id)}
                                    </p>
                                    {slot.staff_id && (
                                      <p className="text-[11px] text-muted-foreground pl-1.5 mt-0.5 truncate">
                                        {getStaffName(slot.staff_id)}
                                      </p>
                                    )}
                                    {slot.room_id && (
                                      <p className="text-[11px] text-muted-foreground/70 pl-1.5">
                                        {getRoomName(slot.room_id)}
                                      </p>
                                    )}
                                    {(hasTeacherConflict || hasRoomConflict) && (
                                      <div className="absolute top-1 right-1">
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                      </div>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => removeSlot(period.id, dayNum)}
                                    className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100"
                                  >
                                    <X className="h-3 w-3 text-red-500" />
                                  </button>

                                  {/* Conflict tooltip */}
                                  {cellConflicts.length > 0 && (
                                    <div className="hidden group-hover:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 rounded-lg bg-popover border border-border shadow-lg p-2 text-xs text-popover-foreground">
                                      {cellConflicts.map((c, i) => (
                                        <p
                                          key={i}
                                          className={`flex items-start gap-1 ${
                                            c.type === "teacher"
                                              ? "text-red-600"
                                              : "text-yellow-600"
                                          }`}
                                        >
                                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                          {c.message}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setOpenCell(
                                      isOpen
                                        ? null
                                        : { periodId: period.id, dayOfWeek: dayNum }
                                    )
                                  }
                                  className="w-full text-left rounded-md p-2 hover:bg-muted/50 transition-colors min-h-[60px] text-muted-foreground/40 text-xs"
                                >
                                  {isOpen ? "Select..." : "+"}
                                </button>
                              )}

                              {/* Assignment dropdown */}
                              {isOpen && (
                                <div className="absolute z-30 top-full left-0 mt-1 w-56 rounded-lg bg-popover border border-border shadow-xl p-1">
                                  <div className="p-2 border-b border-border">
                                    <p className="text-xs font-medium text-popover-foreground">
                                      {DAYS[dayNum - 1]} — {period.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                      {period.start_time?.slice(0, 5)} – {period.end_time?.slice(0, 5)}
                                    </p>
                                  </div>
                                  <div className="max-h-48 overflow-y-auto p-1">
                                    {assignedSubjectsForClass.length === 0 ? (
                                      <p className="p-2 text-xs text-muted-foreground">
                                        No subjects assigned to this class.
                                      </p>
                                    ) : (
                                      assignedSubjectsForClass.map((sub) => {
                                        const teacher = teacherAssignments.find(
                                          (a) =>
                                            a.subject_id === sub.id &&
                                            a.class_id === selectedClassId
                                        );
                                        return (
                                          <button
                                            key={sub.id}
                                            onClick={() => {
                                              updateSlot(period.id, dayNum, "subject_id", sub.id);
                                              setOpenCell(null);
                                            }}
                                            className="w-full text-left flex items-center gap-2 p-1.5 rounded-md hover:bg-accent transition-colors"
                                          >
                                            <span
                                              className="w-2.5 h-2.5 rounded shrink-0"
                                              style={{ backgroundColor: getSubjectColor(sub.id) }}
                                            />
                                            <div className="min-w-0">
                                              <p className="text-xs font-medium text-popover-foreground truncate">
                                                {sub.name}
                                              </p>
                                              {teacher && (
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                  {getStaffName(teacher.staff_id)}
                                                </p>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                  {slot?.subject_id && (
                                    <div className="p-1 border-t border-border">
                                      <button
                                        onClick={() => {
                                          removeSlot(period.id, dayNum);
                                          setOpenCell(null);
                                        }}
                                        className="w-full text-left flex items-center gap-2 p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span className="text-xs">Clear cell</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings note */}
      {selectedClassId && (
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">
              Click any cell to assign a subject. The teacher and room will auto-fill from assignments.
              Hover a cell to see conflict details. Right-click or press X to clear.
              Use "Generate Draft" to auto-populate based on subject frequencies.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
