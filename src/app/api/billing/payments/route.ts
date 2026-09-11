import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { requireSchoolContext } from "@/lib/services/tenant";
import { requirePermission } from "@/lib/services/rbac";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { updateInvoicePayment } from "@/lib/services/invoice";
import { createReceipt } from "@/lib/services/receipt";
import { createLedgerEntry } from "@/lib/services/ledger";
import { ValidationError, NotFoundError } from "@/lib/errors";

export const GET = createRoute(async ({ user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "read");

  const admin = createAdminClient();
  const { data: payments } = await admin
    .from("payments")
    .select("id, amount, payment_method, reference_number, payment_date, recorded_at, student_account_id, invoices(id, invoice_number, student_id, students(first_name, last_name))")
    .eq("school_id", ctx.schoolId)
    .order("payment_date", { ascending: false })
    .limit(100);

  return NextResponse.json({ payments: payments ?? [] });
});

export const POST = createRoute(async ({ request, user }) => {
  const ctx = await requireSchoolContext(user.id);
  await requirePermission(user.id, ctx.schoolId, "billing", "write");

  const body = await request.json();
  const { invoiceId, amount, paymentMethod, reference } = body;

  if (!invoiceId || typeof invoiceId !== "string") {
    throw new ValidationError("Invoice ID is required");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new ValidationError("Payment amount must be a positive number");
  }
  if (!paymentMethod || typeof paymentMethod !== "string") {
    throw new ValidationError("Payment method is required");
  }

  const admin = createAdminClient();

  const { data: invoice } = await admin
    .from("invoices")
    .select("id, student_id, amount_due, amount_paid, balance")
    .eq("school_id", ctx.schoolId)
    .eq("id", invoiceId)
    .single();

  if (!invoice) throw new NotFoundError("Invoice not found in this school");

  if (amount > Number(invoice.balance)) {
    throw new ValidationError("Payment amount exceeds invoice balance");
  }

  const updatedInvoice = await updateInvoicePayment(ctx.schoolId, invoiceId, amount);

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      school_id: ctx.schoolId,
      student_account_id: invoiceId,
      amount,
      payment_method: paymentMethod,
      reference_number: reference ?? null,
      notes: null,
      recorded_by: user.id,
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  const receipt = await createReceipt({
    schoolId: ctx.schoolId,
    paymentId: payment.id,
    invoiceId,
    studentId: invoice.student_id,
    amount,
    paymentMethod,
    reference,
  });

  const newBalance = updatedInvoice.balance;

  await createLedgerEntry({
    schoolId: ctx.schoolId,
    studentId: invoice.student_id,
    invoiceId,
    paymentId: payment.id,
    entryType: "payment",
    amount,
    balanceAfter: newBalance,
    description: `Payment of KES ${amount.toLocaleString()} received`,
    reference: reference ?? receipt.receiptNumber,
    createdBy: user.id,
  });

  return NextResponse.json({ payment, receipt }, { status: 201 });
});
