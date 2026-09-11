import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server-admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/services/tenant", () => ({
  requireSchoolContext: vi.fn(),
}));

vi.mock("@/lib/services/rbac", () => ({
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/services/invoice", () => ({
  createInvoice: vi.fn(),
}));

import { POST } from "@/app/api/billing/invoices/route";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { createInvoice } from "@/lib/services/invoice";

const mockUser = { id: "user-1", email: "test@test.com" };
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  },
};

const mockAdmin = {
  from: vi.fn(),
};

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(url, options as import("next/dist/server/web/spec-extension/request").RequestInit);
}

describe("POST /api/billing/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
    vi.mocked(requireSchoolContext).mockResolvedValue({
      schoolId: "school-1",
      role: "finance",
      isActive: true,
    });
    vi.mocked(requirePermission).mockResolvedValue();

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "x" }, error: null }),
    };
    mockAdmin.from.mockReturnValue(chain);
  });

  it("creates an invoice with valid params", async () => {
    const invoice = {
      id: "inv-1",
      schoolId: "school-1",
      studentId: "student-1",
      amountDue: 5000,
    };
    vi.mocked(createInvoice).mockResolvedValue(invoice as never);

    const req = makeRequest("http://localhost/api/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "student-1",
        feeStructureId: "fee-1",
        amountDue: 5000,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.invoice).toEqual(invoice);
    expect(createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        schoolId: "school-1",
        studentId: "student-1",
        amountDue: 5000,
      })
    );
  });

  it("returns 422 without studentId", async () => {
    const req = makeRequest("http://localhost/api/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feeStructureId: "fee-1",
        amountDue: 5000,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("returns 422 without feeStructureId", async () => {
    const req = makeRequest("http://localhost/api/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "student-1",
        amountDue: 5000,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("validates amountDue is a positive number", async () => {
    const req = makeRequest("http://localhost/api/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "student-1",
        feeStructureId: "fee-1",
        amountDue: 0,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("validates amountDue rejects negative values", async () => {
    const req = makeRequest("http://localhost/api/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "student-1",
        feeStructureId: "fee-1",
        amountDue: -100,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});
