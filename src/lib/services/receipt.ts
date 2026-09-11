import { createAdminClient } from "@/lib/supabase/server-admin";
import { NotFoundError } from "@/lib/errors";

export interface Receipt {
  id: string;
  schoolId: string;
  receiptNumber: string;
  paymentId: string;
  invoiceId: string | null;
  studentId: string;
  amount: number;
  paymentMethod: string | null;
  reference: string | null;
  issuedAt: string;
}

function mapReceipt(row: Record<string, unknown>): Receipt {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    receiptNumber: row.receipt_number as string,
    paymentId: row.payment_id as string,
    invoiceId: row.invoice_id as string | null,
    studentId: row.student_id as string,
    amount: Number(row.amount),
    paymentMethod: row.payment_method as string | null,
    reference: row.reference as string | null,
    issuedAt: row.issued_at as string,
  };
}

export async function getReceipts(schoolId: string): Promise<Receipt[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("receipts")
    .select("*")
    .eq("school_id", schoolId)
    .order("issued_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapReceipt);
}

export async function getReceiptById(
  schoolId: string,
  receiptId: string
): Promise<Receipt> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("receipts")
    .select("*")
    .eq("school_id", schoolId)
    .eq("id", receiptId)
    .single();

  if (error || !data) throw new NotFoundError("Receipt not found");
  return mapReceipt(data);
}

export async function getReceiptByPaymentId(
  schoolId: string,
  paymentId: string
): Promise<Receipt | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("receipts")
    .select("*")
    .eq("school_id", schoolId)
    .eq("payment_id", paymentId)
    .single();

  if (error || !data) return null;
  return mapReceipt(data);
}

export async function getReceiptsByStudent(
  schoolId: string,
  studentId: string
): Promise<Receipt[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("receipts")
    .select("*")
    .eq("school_id", schoolId)
    .eq("student_id", studentId)
    .order("issued_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapReceipt);
}

export async function generateReceiptNumber(schoolId: string): Promise<string> {
  const admin = createAdminClient();

  // Use atomic increment to prevent race conditions
  const { data, error } = await admin.rpc("next_receipt_number", {
    p_school_id: schoolId,
  });

  if (!error && data) {
    return `RCP-${String(data).padStart(5, "0")}`;
  }

  // Fallback: use count with retry
  const { count } = await admin
    .from("receipts")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId);

  const seq = (count ?? 0) + 1;
  return `RCP-${seq.toString().padStart(5, "0")}`;
}

export async function createReceipt(params: {
  schoolId: string;
  paymentId: string;
  invoiceId?: string;
  studentId: string;
  amount: number;
  paymentMethod?: string;
  reference?: string;
}): Promise<Receipt> {
  const admin = createAdminClient();
  const receiptNumber = await generateReceiptNumber(params.schoolId);

  const { data, error } = await admin
    .from("receipts")
    .insert({
      school_id: params.schoolId,
      receipt_number: receiptNumber,
      payment_id: params.paymentId,
      invoice_id: params.invoiceId ?? null,
      student_id: params.studentId,
      amount: params.amount,
      payment_method: params.paymentMethod ?? null,
      reference: params.reference ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapReceipt(data);
}
