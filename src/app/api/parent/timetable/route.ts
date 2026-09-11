import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";

export const GET = createRoute(async ({ user }) => {
  const admin = createAdminClient();

  const { data: relationships } = await admin
    .from("parent_student_relationships")
    .select("student_id")
    .eq("parent_user_id", user.id)
    .eq("is_active", true);

  const studentIds = (relationships ?? []).map((r) => r.student_id);
  if (studentIds.length === 0) {
    return NextResponse.json({ children: [] });
  }

  const { data: students } = await admin
    .from("students")
    .select(
      `
      id, first_name, last_name, class_id,
      classes!inner(id, name, grades!inner(name))
    `
    )
    .in("id", studentIds)
    .eq("is_active", true);

  const classIds = [...new Set((students ?? []).map((s) => s.class_id).filter(Boolean))] as string[];

  const [slotsRes, periodsRes, colorsRes] = await Promise.all([
    classIds.length > 0
      ? admin
          .from("timetable_slots")
          .select(
            `
            id, day_of_week, period_id, class_id, subject_id, room_id, staff_id,
            periods!inner(id, name, start_time, end_time, position),
            subjects!inner(id, name),
            rooms(id, name),
            staff(id, first_name, last_name)
          `
          )
          .in("class_id", classIds)
      : { data: [], error: null },
    admin
      .from("periods")
      .select("id, name, start_time, end_time, position")
      .order("position", { ascending: true }),
    admin.from("subject_colors").select("subject_id, color"),
  ]);

  const colorMap: Record<string, string> = {};
  (colorsRes.data ?? []).forEach((sc) => {
    colorMap[sc.subject_id] = sc.color;
  });

  const periods = periodsRes.data ?? [];
  const slots = (slotsRes.data ?? []) as Record<string, unknown>[];

  const children = (students ?? []).map((student) => {
    const cls = student.classes as unknown as Record<string, unknown>;
    const grade = cls.grades as unknown as Record<string, unknown>;
    const childSlots = slots
      .filter((s) => s.class_id === student.class_id)
      .map((s) => {
        const periods = s.periods as unknown as Record<string, unknown>;
        const subjects = s.subjects as unknown as Record<string, unknown>;
        const rooms = s.rooms as unknown as Record<string, unknown>;
        const staff = s.staff as unknown as Record<string, unknown> | null;
        return {
          id: s.id as string,
          dayOfWeek: s.day_of_week as number,
          periodId: s.period_id as string,
          periodName: periods?.name as string,
          startTime: periods?.start_time as string,
          endTime: periods?.end_time as string,
          position: periods?.position as number,
          subjectId: s.subject_id as string,
          subjectName: subjects?.name as string,
          roomName: (rooms?.name as string) ?? null,
          teacherName: staff
            ? `${(staff.first_name as string) ?? ""} ${(staff.last_name as string) ?? ""}`.trim()
            : null,
          color: colorMap[s.subject_id as string] ?? null,
        };
      });

    return {
      studentId: student.id,
      firstName: student.first_name as string,
      lastName: student.last_name as string,
      className: cls.name as string,
      gradeName: grade.name as string,
      timetable: childSlots,
    };
  });

  return NextResponse.json({ children, periods });
});
