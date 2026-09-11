import { createAdminClient } from "@/lib/supabase/server-admin";

export interface LedgerEntry {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceId: string | null;
  paymentId: string | null;
  entryType: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  reference: string | null;
  createdBy: string | null;
  createdAt: string;
}

function mapLedgerEntry(row: Record<string, unknown>): LedgerEntry {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    studentId: row.student_id as string,
    invoiceId: row.invoice_id as string | null,
    paymentId: row.payment_id as string | null,
    entryType: row.entry_type as string,
    amount: Number(row.amount),
    balanceAfter: Number(row.balance_after),
    description: row.description as string | null,
    reference: row.reference as string | null,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
  };
}

export async function getLedgerByStudent(
  schoolId: string,
  studentId: string
): Promise<LedgerEntry[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ledger_entries")
    .select("*")
    .eq("school_id", schoolId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapLedgerEntry);
}

export async function createLedgerEntry(params: {
  schoolId: string;
  studentId: string;
  invoiceId?: string;
  paymentId?: string;
  entryType: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  reference?: string;
  createdBy?: string;
}): Promise<LedgerEntry> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("ledger_entries")
    .insert({
      school_id: params.schoolId,
      student_id: params.studentId,
      invoice_id: params.invoiceId ?? null,
      payment_id: params.paymentId ?? null,
      entry_type: params.entryType,
      amount: params.amount,
      balance_after: params.balanceAfter,
      description: params.description ?? null,
      reference: params.reference ?? null,
      created_by: params.createdBy ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapLedgerEntry(data);
}

export async function getStudentBalance(
  schoolId: string,
  studentId: string
): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ledger_entries")
    .select("balance_after")
    .eq("school_id", schoolId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data ? Number(data.balance_after) : 0;
}
