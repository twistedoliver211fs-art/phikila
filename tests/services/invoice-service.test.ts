import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server-admin", () => ({
  createAdminClient: vi.fn(),
}));

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoicePayment,
} from "@/lib/services/invoice";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { NotFoundError, ValidationError } from "@/lib/errors";

const mockAdmin = {
  from: vi.fn(),
  rpc: vi.fn(),
};

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
};

function setupInvoiceRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv-1",
    school_id: "school-1",
    student_id: "student-1",
    fee_structure_id: "fee-1",
    invoice_number: "INV-00001",
    amount_due: 5000,
    amount_paid: 0,
    discount: 0,
    balance: 5000,
    status: "pending",
    due_date: "2026-06-30",
    term_id: "term-1",
    academic_year_id: "year-1",
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("createInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
    mockAdmin.from.mockReturnValue(mockQuery);
    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.single.mockResolvedValue({ data: setupInvoiceRow(), error: null });
  });

  it("creates an invoice with valid params", async () => {
    const result = await createInvoice({
      schoolId: "school-1",
      studentId: "student-1",
      feeStructureId: "fee-1",
      invoiceNumber: "INV-00001",
      amountDue: 5000,
    });

    expect(result.id).toBe("inv-1");
    expect(result.amountDue).toBe(5000);
    expect(result.status).toBe("pending");
    expect(mockQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        school_id: "school-1",
        student_id: "student-1",
        amount_due: 5000,
        amount_paid: 0,
      })
    );
  });

  it("validates amount must be positive", async () => {
    await expect(
      createInvoice({
        schoolId: "school-1",
        studentId: "student-1",
        feeStructureId: "fee-1",
        invoiceNumber: "INV-00002",
        amountDue: 0,
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      createInvoice({
        schoolId: "school-1",
        studentId: "student-1",
        feeStructureId: "fee-1",
        invoiceNumber: "INV-00003",
        amountDue: -100,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("validates amount must be finite", async () => {
    await expect(
      createInvoice({
        schoolId: "school-1",
        studentId: "student-1",
        feeStructureId: "fee-1",
        invoiceNumber: "INV-00004",
        amountDue: Infinity,
      })
    ).rejects.toThrow(ValidationError);
  });
});

describe("getInvoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  });

  it("returns a list of invoices", async () => {
    mockAdmin.from.mockReturnValue({
      ...mockQuery,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [setupInvoiceRow(), setupInvoiceRow({ id: "inv-2", invoice_number: "INV-00002" })],
        error: null,
      }),
    });

    const result = await getInvoices("school-1");
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("inv-1");
    expect(result[1].invoiceNumber).toBe("INV-00002");
  });

  it("returns empty array when no invoices exist", async () => {
    mockAdmin.from.mockReturnValue({
      ...mockQuery,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getInvoices("school-1");
    expect(result).toHaveLength(0);
  });
});

describe("getInvoiceById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  });

  it("returns a single invoice", async () => {
    mockAdmin.from.mockReturnValue({
      ...mockQuery,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: setupInvoiceRow(), error: null }),
    });

    const result = await getInvoiceById("school-1", "inv-1");
    expect(result.id).toBe("inv-1");
    expect(result.schoolId).toBe("school-1");
  });

  it("throws NotFoundError when invoice does not exist", async () => {
    mockAdmin.from.mockReturnValue({
      ...mockQuery,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
    });

    await expect(getInvoiceById("school-1", "nonexistent")).rejects.toThrow(NotFoundError);
  });
});

describe("updateInvoicePayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  });

  it("updates payment correctly via fallback path", async () => {
    mockAdmin.rpc.mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "function update_invoice_payment does not exist" },
      }),
    });

    const invoiceRow = setupInvoiceRow({ amount_paid: 0, amount_due: 5000, balance: 5000, discount: 0 });
    let callCount = 0;
    mockAdmin.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: invoiceRow, error: null });
        }
        return Promise.resolve({
          data: setupInvoiceRow({ amount_paid: 1000, amount_due: 5000, balance: 4000, discount: 0, status: "partial" }),
          error: null,
        });
      }),
      update: vi.fn().mockReturnThis(),
    }));

    const result = await updateInvoicePayment("school-1", "inv-1", 1000);
    expect(result.amountPaid).toBe(1000);
    expect(result.status).toBe("partial");
  });

  it("rejects payment exceeding balance", async () => {
    mockAdmin.rpc.mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "function update_invoice_payment does not exist" },
      }),
    });

    const invoiceRow = setupInvoiceRow({ amount_paid: 0, amount_due: 5000, discount: 0 });
    mockAdmin.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: invoiceRow, error: null }),
    });

    await expect(
      updateInvoicePayment("school-1", "inv-1", 6000)
    ).rejects.toThrow("Payment exceeds invoice balance");
  });

  it("validates payment amount must be positive", async () => {
    await expect(
      updateInvoicePayment("school-1", "inv-1", 0)
    ).rejects.toThrow(ValidationError);

    await expect(
      updateInvoicePayment("school-1", "inv-1", -100)
    ).rejects.toThrow(ValidationError);
  });

  it("validates discount must be non-negative", async () => {
    await expect(
      updateInvoicePayment("school-1", "inv-1", 100, -50)
    ).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError when invoice not found in fallback", async () => {
    mockAdmin.rpc.mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "function update_invoice_payment does not exist" },
      }),
    });

    mockAdmin.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
    });

    await expect(
      updateInvoicePayment("school-1", "nonexistent", 100)
    ).rejects.toThrow(NotFoundError);
  });
});
