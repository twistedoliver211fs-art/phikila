"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Printer, Download, FileSpreadsheet } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

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
  grades: { name: string }[];
}

interface Subject {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
}

interface TimetableSlot {
  id?: string;
  period_id: string;
  day_of_week: number;
  class_id: string;
  subject_id: string;
  staff_id: string;
  room_id: string;
  rooms?: { name: string };
  subjects?: { name: string };
}

interface SubjectColor {
  subject_id: string;
  color: string;
}

type PrintMode = "per-class" | "per-teacher" | "all-classes" | "all-teachers";

export default function PrintTimetablesPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<PrintMode>("per-class");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [periods, setPeriods] = useState<Period[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [subjectColors, setSubjectColors] = useState<SubjectColor[]>([]);
  const [loading, setLoading] = useState(true);

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

          const [
            periodsRes,
            classesRes,
            subjectsRes,
            staffRes,
            slotsRes,
            colorsRes,
          ] = await Promise.all([
            supabase
              .from("periods")
              .select("*")
              .eq("school_id", sm.school_id)
              .order("position"),
            supabase
              .from("classes")
              .select("id, name, grades(name)")
              .eq("school_id", sm.school_id),
            supabase
              .from("subjects")
              .select("id, name")
              .eq("school_id", sm.school_id),
            supabase
              .from("staff")
              .select("id, first_name, last_name")
              .eq("school_id", sm.school_id)
              .eq("is_active", true),
            supabase
              .from("timetable_slots")
              .select("*, rooms(name), subjects(name)")
              .eq("school_id", sm.school_id),
            supabase
              .from("subject_colors")
              .select("subject_id, color")
              .eq("school_id", sm.school_id),
          ]);

          setPeriods(periodsRes.data ?? []);
          setClasses(classesRes.data ?? []);
          setSubjects(subjectsRes.data ?? []);
          setStaff(staffRes.data ?? []);
          setSlots(slotsRes.data ?? []);
          setSubjectColors(colorsRes.data ?? []);
          setLoading(false);
        });
    });
  }, []);

  const colorMap: Record<string, string> = {};
  subjectColors.forEach((sc) => {
    colorMap[sc.subject_id] = sc.color;
  });

  const getSlot = (periodId: string, dayOfWeek: number) =>
    slots.find((s) => s.period_id === periodId && s.day_of_week === dayOfWeek);

  const getFilteredSlots = () => {
    if (mode === "per-class" && selectedClassId) {
      return slots.filter((s) => s.class_id === selectedClassId);
    }
    if (mode === "per-teacher" && selectedTeacherId) {
      return slots.filter((s) => s.staff_id === selectedTeacherId);
    }
    return slots;
  };

  const getSelectedLabel = () => {
    if (mode === "per-class" && selectedClassId) {
      const cls = classes.find((c) => c.id === selectedClassId);
      return cls
        ? `${(cls.grades as any)?.[0]?.name ?? ""} ${cls.name}`.trim()
        : "";
    }
    if (mode === "per-teacher" && selectedTeacherId) {
      const t = staff.find((s) => s.id === selectedTeacherId);
      return t ? `${t.first_name} ${t.last_name}` : "";
    }
    return "";
  };

  const filteredSlots = getFilteredSlots();
  const filteredTimetable: Record<string, Record<string, any>> = {};
  filteredSlots.forEach((slot) => {
    const dayKey = String(slot.day_of_week);
    if (!filteredTimetable[dayKey]) filteredTimetable[dayKey] = {};
    filteredTimetable[dayKey][String(slot.period_id)] = slot;
  });

  const handlePrint = () => window.print();

  const handlePDF = async () => {
    if (!printRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("timetable.pdf");
  };

  const handleExcel = async () => {
    const XLSX = await import("xlsx");
    const data: (string | number)[][] = [
      [
        "PHIKILA SCHOOL",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "TIMETABLE",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [],
    ];

    const title =
      mode === "per-class" || mode === "per-teacher"
        ? `TIMETABLE — ${getSelectedLabel()}`
        : mode === "all-classes"
          ? "ALL CLASSES TIMETABLE"
          : "ALL TEACHERS TIMETABLE";
    data.push([title, "", "", "", "", "", "", "", ""]);
    data.push([]);

    const headerRow = ["Period", "Time", ...days];
    data.push(headerRow);

    periods.forEach((period) => {
      const row: (string | number)[] = [
        period.name,
        `${period.start_time?.slice(0, 5)} - ${period.end_time?.slice(0, 5)}`,
      ];
      days.forEach((_, dayIdx) => {
        const slot = filteredTimetable[String(dayIdx + 1)]?.[String(period.id)];
        if (slot) {
          const subject = (slot.subjects as any)?.name ?? "";
          const cls =
            mode === "per-class"
              ? ""
              : ` ${(slot as any).classes?.grades?.name ?? ""} ${(slot as any).classes?.name ?? ""}`;
          const teacher =
            mode === "per-teacher"
              ? ""
              : ` · ${staff.find((s) => s.id === slot.staff_id)?.first_name ?? ""} ${staff.find((s) => s.id === slot.staff_id)?.last_name ?? ""}`;
          row.push(`${subject}${cls}${teacher}`);
        } else {
          row.push("");
        }
      });
      data.push(row);
    });

    data.push([]);
    data.push([
      "Note: All students must be in class 5 minutes before the bell.",
    ]);
    data.push([
      `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`,
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 18 }, { wch: 16 }, ...days.map(() => ({ wch: 30 }))];
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, "timetable.xlsx");
  };

  const renderTimetableGrid = (
    timetableData: Record<string, Record<string, any>>,
    periodsToRender: Period[],
    showTeacher: boolean,
    showClass: boolean
  ) => (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-800">
          <th className="p-2 text-left font-bold text-gray-900 w-28 border-r border-gray-300">
            Period
          </th>
          <th className="p-2 text-left font-bold text-gray-900 w-24 border-r border-gray-300">
            Time
          </th>
          {days.map((day) => (
            <th
              key={day}
              className="p-2 text-left font-bold text-gray-900 border-r border-gray-300 last:border-r-0"
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {periodsToRender.map((period) => (
          <tr key={period.id} className="border-b border-gray-200">
            <td className="p-2 font-semibold text-gray-900 text-xs border-r border-gray-300">
              {period.name}
            </td>
            <td className="p-2 text-gray-600 text-xs border-r border-gray-300">
              {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
            </td>
            {days.map((_, dayIdx) => {
              const slot = timetableData[String(dayIdx + 1)]?.[String(period.id)];
              const subjectId = slot?.subject_id;
              const bgColor = subjectId ? colorMap[subjectId] || null : null;
              const bgTint = bgColor ? `${bgColor}20` : undefined;
              const borderColor = bgColor ? `${bgColor}50` : undefined;

              if (!slot) {
                return (
                  <td
                    key={dayIdx}
                    className="p-2 border-r border-gray-300 last:border-r-0"
                  >
                    <div className="h-12 rounded border border-dashed border-gray-200" />
                  </td>
                );
              }

              const subjectName = (slot.subjects as any)?.name ?? "—";
              const className = showClass
                ? ` ${(slot as any).classes?.grades?.name ?? ""} ${(slot as any).classes?.name ?? ""}`
                : "";
              const teacherName = showTeacher
                ? ` · ${staff.find((s) => s.id === slot.staff_id)?.first_name ?? ""} ${staff.find((s) => s.id === slot.staff_id)?.last_name ?? ""}`
                : "";

              return (
                <td
                  key={dayIdx}
                  className="p-2 border-r border-gray-300 last:border-r-0"
                >
                  <div
                    className="h-12 rounded border p-1.5 flex flex-col justify-center"
                    style={{
                      backgroundColor: bgTint,
                      borderColor: borderColor || "#e5e7eb",
                    }}
                  >
                    <p
                      className="text-xs font-bold leading-tight"
                      style={{ color: bgColor || "#1f2937" }}
                    >
                      {subjectName}
                    </p>
                    {(className || teacherName) && (
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                        {className}
                        {teacherName}
                      </p>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const formatDate = () =>
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const showAllItems = mode === "all-classes" || mode === "all-teachers";
  const itemsToShow = showAllItems
    ? mode === "all-classes"
      ? classes.map((c) => ({
          id: c.id,
          label: `${(c.grades as any)?.[0]?.name ?? ""} ${c.name}`.trim(),
        }))
      : staff.map((s) => ({
          id: s.id,
          label: `${s.first_name} ${s.last_name}`,
        }))
    : [{ id: "selected", label: getSelectedLabel() }];

  const getItemTimetable = (itemId: string) => {
    if (mode === "per-class" || mode === "all-classes") {
      return slots.filter((s) => s.class_id === itemId);
    }
    return slots.filter((s) => s.staff_id === itemId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Print Timetables
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate printable timetables for classes and teachers
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Mode
          </label>
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as PrintMode);
              setSelectedClassId("");
              setSelectedTeacherId("");
            }}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="per-class">Per Class</option>
            <option value="per-teacher">Per Teacher</option>
            <option value="all-classes">All Classes</option>
            <option value="all-teachers">All Teachers</option>
          </select>
        </div>

        {mode === "per-class" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose a class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c.grades as any)?.[0]?.name ?? ""} {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "per-teacher" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Select Teacher
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose a teacher...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={loading}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePDF}
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExcel}
            disabled={loading}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading timetable data...
        </div>
      ) : (
        <div className="space-y-6">
          {itemsToShow.map((item) => {
            if (mode === "per-class" && !selectedClassId) return null;
            if (mode === "per-teacher" && !selectedTeacherId) return null;

            const itemSlots = getItemTimetable(item.id);
            const itemTimetable: Record<string, Record<string, any>> = {};
            itemSlots.forEach((slot) => {
              const dayKey = String(slot.day_of_week);
              if (!itemTimetable[dayKey]) itemTimetable[dayKey] = {};
              itemTimetable[dayKey][String(slot.period_id)] = slot;
            });

            const showTeacher = mode !== "per-teacher";
            const showClass = mode !== "per-class" && mode !== "all-classes";

            return (
              <div
                key={item.id}
                ref={itemsToShow.length === 1 ? printRef : undefined}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="print-area">
                  {/* School header */}
                  <div className="text-center py-6 border-b border-border print:border-gray-800">
                    <h2 className="text-2xl font-bold text-foreground print:text-gray-900">
                      PHIKILA SCHOOL
                    </h2>
                    <p className="text-sm italic text-muted-foreground print:text-gray-600 mt-1">
                      &quot;Excellence in Education&quot;
                    </p>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-foreground print:text-gray-900">
                        TIMETABLE — {item.label.toUpperCase()}
                      </h3>
                      <p className="text-sm text-muted-foreground print:text-gray-600">
                        Term 2, 2026
                      </p>
                    </div>
                  </div>

                  {/* Timetable grid */}
                  <div className="p-4 overflow-x-auto">
                    {renderTimetableGrid(
                      itemTimetable,
                      periods,
                      showTeacher,
                      showClass
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 pb-4 pt-2 border-t border-border print:border-gray-300">
                    <p className="text-xs text-muted-foreground print:text-gray-600 italic">
                      Note: All students must be in class 5 minutes before the
                      bell.
                    </p>
                    <p className="text-xs text-muted-foreground print:text-gray-600 mt-2">
                      Generated: {formatDate()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {mode === "per-class" && !selectedClassId && (
            <div className="text-center py-12 text-muted-foreground">
              Select a class to preview its timetable
            </div>
          )}
          {mode === "per-teacher" && !selectedTeacherId && (
            <div className="text-center py-12 text-muted-foreground">
              Select a teacher to preview their timetable
            </div>
          )}
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .print-area table {
            font-size: 11px;
          }
          .print-area th,
          .print-area td {
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  );
}
