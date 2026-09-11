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

  const { data: slots } = classIds.length > 0
    ? await admin
        .from("timetable_slots")
        .select(
          `
          id, day_of_week, period_id, class_id, subject_id, room_id,
          periods!inner(id, name, start_time, end_time, position),
          subjects!inner(id, name),
          rooms(id, name),
          staff(id, first_name, last_name)
        `
        )
        .in("class_id", classIds)
    : { data: [] };

  const children = (students ?? []).map((student) => {
    const cls = student.classes as unknown as Record<string, unknown>;
    const grade = cls.grades as unknown as Record<string, unknown>;
    const childSlots = (slots ?? [])
      .filter((s) => s.class_id === student.class_id)
      .map((s) => {
        const period = s.periods as unknown as Record<string, unknown>;
        const subject = s.subjects as unknown as Record<string, unknown>;
        const room = s.rooms as unknown as Record<string, unknown>;
        const staff = s.staff as unknown as Record<string, unknown> | null;
        return {
          id: s.id,
          dayOfWeek: s.day_of_week,
          periodName: period?.name,
          startTime: period?.start_time,
          endTime: period?.end_time,
          position: period?.position,
          subjectName: subject?.name,
          roomName: room?.name ?? null,
          teacherName: staff
            ? `${(staff.first_name as string) ?? ""} ${(staff.last_name as string) ?? ""}`.trim()
            : null,
        };
      });

    return {
      studentId: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      className: cls.name,
      gradeName: grade.name,
      timetable: childSlots,
    };
  });

  return NextResponse.json({ children });
});
