import { describe, it, expect } from "vitest";
import { sanitizeAttendanceRecords, sanitizeMarkRecords } from "@/lib/sync-payload";

const schoolId = "11111111-1111-4111-8111-111111111111";
const studentId = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";
const examId = "44444444-4444-4444-8444-444444444444";
const subjectId = "55555555-5555-4555-8555-555555555555";

describe("sanitizeAttendanceRecords", () => {
  it("keeps valid rows in allowed schools and stamps recorded_by", () => {
    const rows = sanitizeAttendanceRecords(
      [
        {
          student_id: studentId,
          school_id: schoolId,
          date: "2026-09-07",
          status: "present",
          recorded_by: "attacker",
        },
      ],
      { allowedSchoolIds: new Set([schoolId]), userId }
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].recorded_by).toBe(userId);
  });

  it("drops records for other schools and invalid statuses", () => {
    const rows = sanitizeAttendanceRecords(
      [
        {
          student_id: studentId,
          school_id: "66666666-6666-4666-8666-666666666666",
          date: "2026-09-07",
          status: "present",
        },
        {
          student_id: studentId,
          school_id: schoolId,
          date: "2026-09-07",
          status: "not-a-status",
        },
      ],
      { allowedSchoolIds: new Set([schoolId]), userId }
    );
    expect(rows).toHaveLength(0);
  });
});

describe("sanitizeMarkRecords", () => {
  it("rejects scores outside 0-100", () => {
    const rows = sanitizeMarkRecords(
      [{ exam_id: examId, student_id: studentId, subject_id: subjectId, score: 140 }],
      { userId }
    );
    expect(rows).toHaveLength(0);
  });

  it("accepts valid scores", () => {
    const rows = sanitizeMarkRecords(
      [{ exam_id: examId, student_id: studentId, subject_id: subjectId, score: 72 }],
      { userId }
    );
    expect(rows).toEqual([
      {
        exam_id: examId,
        student_id: studentId,
        subject_id: subjectId,
        score: 72,
        recorded_by: userId,
      },
    ]);
  });
});
