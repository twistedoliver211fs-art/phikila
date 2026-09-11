import { createAdminClient } from "@/lib/supabase/server-admin";
import { NotFoundError, ValidationError } from "@/lib/errors";

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  discount: number;
  balance: number;
  status: "pending" | "partial" | "paid" | "overdue" | "cancelled";
  dueDate: string | null;
  termId: string | null;
  academicYearId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    studentId: row.student_id as string,
    feeStructureId: row.fee_structure_id as string,
    invoiceNumber: row.invoice_number as string,
    amountDue: Number(row.amount_due),
    amountPaid: Number(row.amount_paid),
    discount: Number(row.discount),
    balance: Number(row.balance),
    status: row.status as Invoice["status"],
    dueDate: row.due_date as string | null,
    termId: row.term_id as string | null,
    academicYearId: row.academic_year_id as string | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getInvoices(schoolId: string): Promise<Invoice[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invoices")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapInvoice);
}

export async function getInvoiceById(
  schoolId: string,
  invoiceId: string
): Promise<Invoice> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invoices")
    .select("*")
    .eq("school_id", schoolId)
    .eq("id", invoiceId)
    .single();

  if (error || !data) throw new NotFoundError("Invoice not found");
  return mapInvoice(data);
}

export async function createInvoice(params: {
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  invoiceNumber: string;
  amountDue: number;
  discount?: number;
  dueDate?: string;
  termId?: string;
  academicYearId?: string;
  notes?: string;
}): Promise<Invoice> {
  const admin = createAdminClient();

  if (params.amountDue <= 0 || !Number.isFinite(params.amountDue)) {
    throw new ValidationError("Amount due must be a positive number");
  }

  const { data, error } = await admin
    .from("invoices")
    .insert({
      school_id: params.schoolId,
      student_id: params.studentId,
      fee_structure_id: params.feeStructureId,
      invoice_number: params.invoiceNumber,
      amount_due: params.amountDue,
      amount_paid: 0,
      discount: params.discount ?? 0,
      status: "pending",
      due_date: params.dueDate ?? null,
      term_id: params.termId ?? null,
      academic_year_id: params.academicYearId ?? null,
      notes: params.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapInvoice(data);
}

export async function updateInvoicePayment(
  schoolId: string,
  invoiceId: string,
  amountPaid: number,
  discount?: number
): Promise<Invoice> {
  if (amountPaid <= 0 || !Number.isFinite(amountPaid)) {
    throw new ValidationError("Payment amount must be a positive number");
  }
  if (discount !== undefined && (discount < 0 || !Number.isFinite(discount))) {
    throw new ValidationError("Discount must be a non-negative number");
  }

  const admin = createAdminClient();

  // Atomic update to prevent race conditions
  const { data, error } = await admin
    .rpc("update_invoice_payment", {
      p_school_id: schoolId,
      p_invoice_id: invoiceId,
      p_amount_paid: amountPaid,
      p_discount: discount ?? null,
    })
    .single();

  // Fallback if RPC doesn't exist: use atomic SQL
  if (error && error.message?.includes("function")) {
    const { data: invoice } = await admin
      .from("invoices")
      .select("amount_due, amount_paid, discount")
      .eq("school_id", schoolId)
      .eq("id", invoiceId)
      .single();

    if (!invoice) throw new NotFoundError("Invoice not found");

    const currentPaid = Number(invoice.amount_paid);
    const currentDiscount = discount ?? Number(invoice.discount);
    const amountDue = Number(invoice.amount_due);
    const newPaid = currentPaid + amountPaid;

    if (newPaid - currentDiscount > amountDue) {
      throw new ValidationError("Payment exceeds invoice balance");
    }

    const newBalance = amountDue - newPaid - currentDiscount;
    let status: Invoice["status"] = "pending";
    if (newBalance <= 0) status = "paid";
    else if (newPaid > 0) status = "partial";

    const { data: updated, error: updateError } = await admin
      .from("invoices")
      .update({
        amount_paid: newPaid,
        discount: currentDiscount,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("school_id", schoolId)
      .eq("id", invoiceId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updated) throw new NotFoundError("Invoice not found");
    return mapInvoice(updated);
  }

  if (error) throw error;
  if (!data) throw new NotFoundError("Invoice not found");
  return mapInvoice(data as Record<string, unknown>);
}

export async function getInvoicesByStudent(
  schoolId: string,
  studentId: string
): Promise<Invoice[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invoices")
    .select("*")
    .eq("school_id", schoolId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapInvoice);
}
