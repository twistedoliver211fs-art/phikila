const ATTENDANCE_STATUSES = new Set(["present", "absent", "late", "excused"]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export type AttendanceSyncRow = {
  student_id: string;
  date: string;
  status: string;
  school_id: string;
  recorded_by: string;
};

export type MarksSyncRow = {
  exam_id: string;
  student_id: string;
  subject_id: string;
  score: number;
  recorded_by: string;
};

export function sanitizeAttendanceRecords(
  records: unknown,
  opts: { allowedSchoolIds: Set<string>; userId: string; max?: number }
): AttendanceSyncRow[] {
  if (!Array.isArray(records)) return [];
  const max = opts.max ?? 500;
  const cleaned: AttendanceSyncRow[] = [];

  for (const raw of records) {
    if (cleaned.length >= max) break;
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (!isUuid(r.student_id) || !isUuid(r.school_id)) continue;
    if (!opts.allowedSchoolIds.has(r.school_id)) continue;
    if (typeof r.date !== "string" || !DATE_RE.test(r.date)) continue;
    if (typeof r.status !== "string" || !ATTENDANCE_STATUSES.has(r.status)) continue;

    cleaned.push({
      student_id: r.student_id,
      date: r.date,
      status: r.status,
      school_id: r.school_id,
      recorded_by: opts.userId,
    });
  }

  return cleaned;
}

export function sanitizeMarkRecords(
  records: unknown,
  opts: { userId: string; max?: number }
): MarksSyncRow[] {
  if (!Array.isArray(records)) return [];
  const max = opts.max ?? 500;
  const cleaned: MarksSyncRow[] = [];

  for (const raw of records) {
    if (cleaned.length >= max) break;
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (!isUuid(r.exam_id) || !isUuid(r.student_id) || !isUuid(r.subject_id)) continue;
    const score = typeof r.score === "number" ? r.score : Number(r.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) continue;

    cleaned.push({
      exam_id: r.exam_id,
      student_id: r.student_id,
      subject_id: r.subject_id,
      score,
      recorded_by: opts.userId,
    });
  }

  return cleaned;
}
