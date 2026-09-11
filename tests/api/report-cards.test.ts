import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server-admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/helpers", () => ({
  getCurrentSchoolId: vi.fn(),
}));

vi.mock("@/lib/services/reportcard", () => ({
  getReportCards: vi.fn(),
  getReportCardById: vi.fn(),
  generateReportCard: vi.fn(),
}));

import { GET, POST } from "@/app/api/report-cards/route";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import {
  getReportCards,
  getReportCardById,
  generateReportCard,
} from "@/lib/services/reportcard";

const mockUser = { id: "user-1", email: "test@test.com" };
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  },
};

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(url, options as import("next/dist/server/web/spec-extension/request").RequestInit);
}

describe("GET /api/report-cards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(getCurrentSchoolId).mockResolvedValue("school-1");
  });

  it("returns report cards for a school", async () => {
    const cards = [{ id: "rc-1", schoolId: "school-1" }];
    vi.mocked(getReportCards).mockResolvedValue(cards as never);

    const req = makeRequest("http://localhost/api/report-cards");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.reportCards).toEqual(cards);
    expect(getReportCards).toHaveBeenCalledWith("school-1", undefined);
  });

  it("returns single report card when id is provided", async () => {
    const card = { id: "rc-1", schoolId: "school-1" };
    vi.mocked(getReportCardById).mockResolvedValue(card as never);

    const req = makeRequest("http://localhost/api/report-cards?id=rc-1");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.reportCard).toEqual(card);
    expect(getReportCardById).toHaveBeenCalledWith("rc-1");
  });

  it("returns 400 when no active school", async () => {
    vi.mocked(getCurrentSchoolId).mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/report-cards");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("No active school");
  });

  it("filters by examId when provided", async () => {
    vi.mocked(getReportCards).mockResolvedValue([]);

    const req = makeRequest("http://localhost/api/report-cards?examId=exam-1");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(getReportCards).toHaveBeenCalledWith("school-1", "exam-1");
  });
});

describe("POST /api/report-cards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(getCurrentSchoolId).mockResolvedValue("school-1");
  });

  it("creates a report card with valid params", async () => {
    const reportCard = { id: "rc-1", schoolId: "school-1", studentId: "student-1" };
    vi.mocked(generateReportCard).mockResolvedValue(reportCard as never);

    const req = makeRequest("http://localhost/api/report-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "student-1",
        examId: "exam-1",
        classId: "class-1",
        academicYearId: "year-1",
        termId: "term-1",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.reportCard).toEqual(reportCard);
    expect(generateReportCard).toHaveBeenCalledWith({
      schoolId: "school-1",
      studentId: "student-1",
      examId: "exam-1",
      classId: "class-1",
      academicYearId: "year-1",
      termId: "term-1",
    });
  });

  it("returns 400 without required fields", async () => {
    const req = makeRequest("http://localhost/api/report-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: "student-1" }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 400 when no active school", async () => {
    vi.mocked(getCurrentSchoolId).mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/report-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "student-1",
        examId: "exam-1",
        classId: "class-1",
        academicYearId: "year-1",
        termId: "term-1",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
