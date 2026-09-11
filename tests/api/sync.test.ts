import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/services/sync", () => ({
  syncAttendanceRecords: vi.fn(),
}));

import { POST } from "@/app/api/sync/attendance/route";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { syncAttendanceRecords } from "@/lib/services/sync";

const mockUser = { id: "user-1", email: "test@test.com" };
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  },
  from: vi.fn(),
};

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("http://localhost/api/sync/attendance", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/sync/attendance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 29, resetAt: Date.now() + 60_000 });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { active_school_id: "school-1" }, error: null }),
    };
    mockSupabase.from.mockReturnValue(profileChain);
  });

  it("syncs attendance records successfully", async () => {
    vi.mocked(syncAttendanceRecords).mockResolvedValue({
      synced: 2,
      skipped: 0,
      conflicts: [],
    });

    const req = makeRequest({
      records: [
        { id: "r1", student_id: "s1", date: "2026-01-01", status: "present" },
        { id: "r2", student_id: "s2", date: "2026-01-01", status: "absent" },
      ],
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.synced).toBe(2);
    expect(body.conflicts).toHaveLength(0);
  });

  it("returns 400 for invalid payload", async () => {
    const req = makeRequest({ records: "not-an-array" });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid payload");
  });

  it("returns 400 when records is missing", async () => {
    const req = makeRequest({});

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid payload");
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const req = makeRequest({
      records: [{ id: "r1", student_id: "s1", date: "2026-01-01", status: "present" }],
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toContain("Too many requests");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns conflicts from sync", async () => {
    vi.mocked(syncAttendanceRecords).mockResolvedValue({
      synced: 0,
      skipped: 0,
      conflicts: [
        {
          table: "attendance",
          key: { student_id: "s1", date: "2026-01-01" },
          client: { id: "r1", status: "present", notes: null, updated_at: null },
          server: { id: "srv-1", status: "absent", notes: null, updated_at: "2026-01-01T12:00:00Z" },
        },
      ],
    });

    const req = makeRequest({
      records: [{ id: "r1", student_id: "s1", date: "2026-01-01", status: "present" }],
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.synced).toBe(0);
    expect(body.conflicts).toHaveLength(1);
    expect(body.conflicts[0].client.status).toBe("present");
    expect(body.conflicts[0].server.status).toBe("absent");
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: "not authed" } }),
      },
    } as never);

    const req = makeRequest({
      records: [{ id: "r1", student_id: "s1", date: "2026-01-01", status: "present" }],
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Not authenticated");
  });

  it("returns 403 when no active school", async () => {
    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { active_school_id: null }, error: null }),
    };
    mockSupabase.from.mockReturnValue(profileChain);

    const req = makeRequest({
      records: [{ id: "r1", student_id: "s1", date: "2026-01-01", status: "present" }],
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("No active school");
  });
});
