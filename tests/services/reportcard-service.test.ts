import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server-admin", () => ({
  createAdminClient: vi.fn(),
}));

import {
  generateReportCard,
  getReportCards,
  getReportCardById,
} from "@/lib/services/reportcard";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { NotFoundError } from "@/lib/errors";

const mockAdmin = {
  from: vi.fn(),
};

function reportCardRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "rc-1",
    school_id: "school-1",
    student_id: "student-1",
    exam_id: "exam-1",
    class_id: "class-1",
    academic_year_id: "year-1",
    term_id: "term-1",
    total_score: 400,
    average_score: 80,
    class_rank: 1,
    class_size: 30,
    overall_grade: "A",
    remarks: null,
    generated_at: "2026-01-01T00:00:00Z",
    generated_by: null,
    ...overrides,
  };
}

function makeChain(response: { data: unknown; error: unknown; count?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(response);
  chain.then = function (resolve: (v: unknown) => void) {
    resolve(response);
  };
  return chain;
}

describe("generateReportCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  });

  it("creates a report card with computed scores", async () => {
    const chains = [
      makeChain({ data: null, error: null }),
      makeChain({ data: [{ score: 80 }, { score: 90 }, { score: 70 }], error: null }),
      makeChain({ data: null, error: null, count: 30 }),
      makeChain({ data: [{ student_id: "s1" }, { student_id: "s2" }], error: null }),
      makeChain({ data: [{ score: 80 }, { score: 90 }], error: null }),
      makeChain({ data: [{ score: 70 }, { score: 85 }], error: null }),
      makeChain({ data: reportCardRow(), error: null }),
    ];

    let callIndex = 0;
    mockAdmin.from.mockImplementation(() => chains[callIndex++] ?? makeChain({ data: null, error: null }));

    const result = await generateReportCard({
      schoolId: "school-1",
      studentId: "student-1",
      examId: "exam-1",
      classId: "class-1",
      academicYearId: "year-1",
      termId: "term-1",
    });

    expect(result.id).toBe("rc-1");
    expect(result.schoolId).toBe("school-1");
    expect(result.studentId).toBe("student-1");
  });

  it("returns existing report card if already generated", async () => {
    mockAdmin.from.mockReturnValue(makeChain({ data: { id: "rc-1" }, error: null }));

    const result = await generateReportCard({
      schoolId: "school-1",
      studentId: "student-1",
      examId: "exam-1",
      classId: "class-1",
      academicYearId: "year-1",
      termId: "term-1",
    });

    expect(result.id).toBe("rc-1");
  });
});

describe("getReportCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  });

  it("returns a list of report cards", async () => {
    const eqMock = vi.fn().mockReturnThis();
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: eqMock,
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => void) => {
        resolve({ data: [reportCardRow(), reportCardRow({ id: "rc-2" })], error: null });
      },
    };
    Object.defineProperty(chain, "select", { value: vi.fn().mockReturnValue(chain) });

    mockAdmin.from.mockReturnValue(chain);

    const result = await getReportCards("school-1");
    expect(result).toHaveLength(2);
  });

  it("filters by examId when provided", async () => {
    const eqMock = vi.fn().mockReturnThis();
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: eqMock,
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => void) => {
        resolve({ data: [reportCardRow({ exam_id: "exam-2" })], error: null });
      },
    };

    mockAdmin.from.mockReturnValue(chain);

    const result = await getReportCards("school-1", "exam-2");
    expect(result).toHaveLength(1);
    expect(eqMock).toHaveBeenCalledWith("exam_id", "exam-2");
  });

  it("returns empty array when no report cards exist", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => void) => {
        resolve({ data: [], error: null });
      },
    };

    mockAdmin.from.mockReturnValue(chain);

    const result = await getReportCards("school-1");
    expect(result).toHaveLength(0);
  });
});

describe("getReportCardById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  });

  it("returns a report card with details", async () => {
    const baseRow = reportCardRow();
    const detailRow = {
      ...baseRow,
      students: { first_name: "John", last_name: "Doe", admission_number: "ADM001" },
      classes: { name: "Form 1A" },
      exams: { name: "Midterm" },
      terms: { name: "Term 1" },
      academic_years: { name: "2026" },
    };

    let callCount = 0;
    mockAdmin.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return makeChain({ data: detailRow, error: null });
      }
      return makeChain({ data: null, error: null });
    });

    const result = await getReportCardById("rc-1");
    expect(result.studentName).toBe("John Doe");
    expect(result.className).toBe("Form 1A");
    expect(result.examName).toBe("Midterm");
  });

  it("throws NotFoundError when report card does not exist", async () => {
    mockAdmin.from.mockReturnValue(makeChain({ data: null, error: { message: "not found" } }));

    await expect(getReportCardById("nonexistent")).rejects.toThrow(NotFoundError);
  });
});
