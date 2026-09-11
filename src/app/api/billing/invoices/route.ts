import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { getInvoices, createInvoice } from "@/lib/services/invoice";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { ValidationError, NotFoundError } from "@/lib/errors";

async function generateInvoiceNumber(schoolId: string): Promise<string> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId);

  const seq = (count ?? 0) + 1;
  return `INV-${seq.toString().padStart(5, "0")}`;
}

export const GET = createRoute(async ({ user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "read");

  const invoices = await getInvoices(ctx.schoolId);
  return NextResponse.json({ invoices });
});

export const POST = createRoute(async ({ request, user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "write");

  const body = await request.json();
  const { studentId, feeStructureId, amountDue, discount, dueDate, termId, academicYearId, notes } = body;

  if (!studentId || typeof studentId !== "string") {
    throw new ValidationError("Student ID is required");
  }
  if (!feeStructureId || typeof feeStructureId !== "string") {
    throw new ValidationError("Fee structure ID is required");
  }
  if (typeof amountDue !== "number" || amountDue <= 0) {
    throw new ValidationError("Amount due must be a positive number");
  }

  const admin = createAdminClient();

  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("school_id", ctx.schoolId)
    .eq("id", studentId)
    .single();

  if (!student) throw new NotFoundError("Student not found in this school");

  const { data: feeStructure } = await admin
    .from("fee_structures")
    .select("id")
    .eq("school_id", ctx.schoolId)
    .eq("id", feeStructureId)
    .single();

  if (!feeStructure) throw new NotFoundError("Fee structure not found in this school");

  const invoiceNumber = await generateInvoiceNumber(ctx.schoolId);

  const invoice = await createInvoice({
    schoolId: ctx.schoolId,
    studentId,
    feeStructureId,
    invoiceNumber,
    amountDue,
    discount: discount ?? 0,
    dueDate: dueDate ?? undefined,
    termId: termId ?? undefined,
    academicYearId: academicYearId ?? undefined,
    notes: notes ?? undefined,
  });

  return NextResponse.json({ invoice }, { status: 201 });
});
