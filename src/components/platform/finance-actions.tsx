"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, DollarSign, X, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/platform/toast";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  reference_number: string | null;
  student_accounts: any;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amountDue: number;
  balance: number;
  studentName?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
}

export function FinanceActions({ payments }: { payments: Payment[] }) {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payReference, setPayReference] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);
  const [invAmount, setInvAmount] = useState("");
  const [invDiscount, setInvDiscount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invNotes, setInvNotes] = useState("");

  const handleExport = () => {
    const headers = ["Student", "Amount", "Date", "Reference"];
    const rows = payments.map((p) => {
      const student = (p.student_accounts as any)?.students;
      const name = student ? `${student.first_name} ${student.last_name}` : "—";
      return [name, String(p.amount), p.payment_date, p.reference_number ?? "—"];
    });

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!showRecordModal) return;
    async function fetchInvoices() {
      const res = await fetch("/api/billing/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices ?? []);
      }
    }
    fetchInvoices();
  }, [showRecordModal]);

  useEffect(() => {
    if (!showInvoiceModal) return;
    async function fetchOptions() {
      const [studentsRes, structuresRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/fee-structures"),
      ]);
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students ?? data ?? []);
      }
      if (structuresRes.ok) {
        const data = await structuresRes.json();
        setFeeStructures(data.structures ?? data.feeStructures ?? data ?? []);
      }
    }
    fetchOptions();
  }, [showInvoiceModal]);

  const filteredInvoices = invoices.filter((inv) => {
    const q = invoiceQuery.toLowerCase();
    return !q || inv.invoiceNumber.toLowerCase().includes(q);
  });

  const filteredStudents = students.filter((s) => {
    const q = studentQuery.toLowerCase();
    return !q || s.first_name.toLowerCase().includes(q) || s.last_name.toLowerCase().includes(q);
  });

  function resetPayForm() {
    setSelectedInvoice(null);
    setPayAmount("");
    setPayMethod("cash");
    setPayReference("");
    setInvoiceQuery("");
    setShowInvoiceDropdown(false);
  }

  function resetInvForm() {
    setSelectedStudent(null);
    setSelectedFeeStructure(null);
    setInvAmount("");
    setInvDiscount("");
    setInvDueDate("");
    setInvNotes("");
    setStudentQuery("");
    setShowStudentDropdown(false);
  }

  async function handleRecordPayment() {
    if (!selectedInvoice || !payAmount || !payMethod) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          reference: payReference || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record payment");
      }
      toast("Payment recorded successfully");
      setShowRecordModal(false);
      resetPayForm();
    } catch (err: any) {
      toast(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateInvoice() {
    if (!selectedStudent || !selectedFeeStructure || !invAmount) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          feeStructureId: selectedFeeStructure.id,
          amountDue: Number(invAmount),
          discount: invDiscount ? Number(invDiscount) : 0,
          dueDate: invDueDate || undefined,
          notes: invNotes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create invoice");
      }
      toast("Invoice created successfully");
      setShowInvoiceModal(false);
      resetInvForm();
    } catch (err: any) {
      toast(err.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />Export
        </Button>
        <Button size="sm" variant="outline" onClick={() => { resetPayForm(); setShowRecordModal(true); }}>
          <DollarSign className="mr-2 h-4 w-4" />Record Payment
        </Button>
        <Button size="sm" onClick={() => { resetInvForm(); setShowInvoiceModal(true); }}>
          <FileText className="mr-2 h-4 w-4" />Create Invoice
        </Button>
      </div>

      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRecordModal(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Record Payment</h2>
              <button onClick={() => setShowRecordModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium">Invoice *</label>
                <input
                  type="text"
                  placeholder={selectedInvoice ? selectedInvoice.invoiceNumber : "Search invoice..."}
                  value={invoiceQuery}
                  onChange={(e) => { setInvoiceQuery(e.target.value); setShowInvoiceDropdown(true); }}
                  onFocus={() => setShowInvoiceDropdown(true)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                />
                {showInvoiceDropdown && filteredInvoices.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 rounded-md border border-border bg-background shadow-lg max-h-48 overflow-y-auto">
                    {filteredInvoices.slice(0, 20).map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => { setSelectedInvoice(inv); setInvoiceQuery(""); setShowInvoiceDropdown(false); setPayAmount(String(inv.balance)); }}
                      >
                        <span className="font-medium">{inv.invoiceNumber}</span>
                        <span className="text-muted-foreground ml-2">Bal: KES {inv.balance.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (KES) *</label>
                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" min="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Method *</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference</label>
                <input type="text" value={payReference} onChange={(e) => setPayReference(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Optional reference" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRecordModal(false)}>Cancel</Button>
              <Button onClick={handleRecordPayment} disabled={!selectedInvoice || !payAmount || submitting}>
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowInvoiceModal(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Invoice</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium">Student *</label>
                <input
                  type="text"
                  placeholder={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : "Search student..."}
                  value={studentQuery}
                  onChange={(e) => { setStudentQuery(e.target.value); setShowStudentDropdown(true); }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                />
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 rounded-md border border-border bg-background shadow-lg max-h-48 overflow-y-auto">
                    {filteredStudents.slice(0, 20).map((s) => (
                      <button key={s.id} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => { setSelectedStudent(s); setStudentQuery(""); setShowStudentDropdown(false); }}>
                        {s.first_name} {s.last_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fee Structure *</label>
                <select
                  value={selectedFeeStructure?.id ?? ""}
                  onChange={(e) => { const fs = feeStructures.find((f) => f.id === e.target.value); if (fs) { setSelectedFeeStructure(fs); setInvAmount(String(fs.amount)); } }}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select fee structure...</option>
                  {feeStructures.map((fs) => (
                    <option key={fs.id} value={fs.id}>{fs.name} — KES {fs.amount.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount Due (KES) *</label>
                  <input type="number" value={invAmount} onChange={(e) => setInvAmount(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" min="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount (KES)</label>
                  <input type="number" value={invDiscount} onChange={(e) => setInvDiscount(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" min="0" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <input type="date" value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea value={invNotes} onChange={(e) => setInvNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
              <Button onClick={handleCreateInvoice} disabled={!selectedStudent || !selectedFeeStructure || !invAmount || submitting}>
                {submitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
