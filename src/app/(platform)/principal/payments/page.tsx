"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, DollarSign, X } from "lucide-react";
import { toast } from "@/components/platform/toast";

interface Payment {
  id: string;
  studentAccountId: string;
  amount: number;
  paymentMethod: string;
  reference: string | null;
  receiptNumber?: string;
  studentName?: string;
  invoiceNumber?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amountDue: number;
  balance: number;
  status: string;
  studentId: string;
  studentName?: string;
}

const methodColors: Record<string, string> = {
  mpesa: "bg-green-100 text-green-800",
  cash: "bg-blue-100 text-blue-800",
  bank_transfer: "bg-purple-100 text-purple-800",
  cheque: "bg-orange-100 text-orange-800",
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reference, setReference] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const res = await fetch("/api/billing/payments");
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.payments ?? []).map((p: any) => {
          const student = p.invoices?.students;
          return {
            id: p.id,
            studentAccountId: p.student_account_id,
            amount: Number(p.amount),
            paymentMethod: p.payment_method,
            reference: p.reference_number,
            studentName: student ? `${student.first_name} ${student.last_name}` : "—",
            invoiceNumber: p.invoices?.invoice_number ?? "—",
            createdAt: p.payment_date ?? p.recorded_at,
          };
        });
        setPayments(mapped);
      }
    } catch {
      console.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!showModal) return;
    async function fetchInvoices() {
      const res = await fetch("/api/billing/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices ?? []);
      }
    }
    fetchInvoices();
  }, [showModal]);

  const filteredInvoices = invoices.filter((inv) => {
    const q = invoiceQuery.toLowerCase();
    return (
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.studentName?.toLowerCase().includes(q) ?? false)
    );
  });

  function resetForm() {
    setSelectedInvoice(null);
    setAmount("");
    setPaymentMethod("cash");
    setReference("");
    setInvoiceQuery("");
    setShowInvoiceDropdown(false);
  }

  async function handleRecord() {
    if (!selectedInvoice || !amount || !paymentMethod) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: Number(amount),
          paymentMethod,
          reference: reference || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record payment");
      }

      toast("Payment recorded successfully");
      setShowModal(false);
      resetForm();
      fetchPayments();
    } catch (err: any) {
      toast(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = payments.filter(
    (p) =>
      (p.reference?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      p.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Record and track student fee payments</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{payments.length} payments</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-left font-medium">Student</th>
                    <th className="p-3 text-left font-medium">Invoice #</th>
                    <th className="p-3 text-left font-medium">Amount</th>
                    <th className="p-3 text-left font-medium">Method</th>
                    <th className="p-3 text-left font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-3">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-medium">{payment.studentName ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{payment.invoiceNumber ?? "—"}</td>
                      <td className="p-3 font-medium">
                        KES {payment.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge className={methodColors[payment.paymentMethod] ?? "bg-gray-100 text-gray-800"}>
                          {payment.paymentMethod}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {payment.reference ?? "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Record Payment</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium">Invoice *</label>
                <input
                  type="text"
                  placeholder={selectedInvoice ? `${selectedInvoice.invoiceNumber} (${selectedInvoice.studentName ?? ""})` : "Search invoice..."}
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
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setInvoiceQuery("");
                          setShowInvoiceDropdown(false);
                          setAmount(String(inv.balance));
                        }}
                      >
                        <span className="font-medium">{inv.invoiceNumber}</span>
                        <span className="text-muted-foreground ml-2">Balance: KES {inv.balance.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Amount (KES) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  min="0"
                  max={selectedInvoice?.balance}
                />
                {selectedInvoice && (
                  <p className="text-xs text-muted-foreground">
                    Max: KES {selectedInvoice.balance.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reference Number</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  placeholder="e.g. M-Pesa code, cheque number"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                onClick={handleRecord}
                disabled={!selectedInvoice || !amount || !paymentMethod || submitting}
              >
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
