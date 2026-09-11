"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { toast } from "@/components/platform/toast";

interface Invoice {
  id: string;
  studentId: string;
  studentName?: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  classes?: { name: string; grades?: { name: string } };
}

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  partial: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);
  const [amountDue, setAmountDue] = useState("");
  const [discount, setDiscount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const res = await fetch("/api/billing/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices ?? []);
      }
    } catch {
      console.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!showModal) return;
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
  }, [showModal]);

  const filteredStudents = students.filter((s) => {
    const q = studentQuery.toLowerCase();
    return (
      !q ||
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q)
    );
  });

  function handleFeeStructureSelect(fs: FeeStructure) {
    setSelectedFeeStructure(fs);
    setAmountDue(String(fs.amount));
  }

  function resetForm() {
    setSelectedStudent(null);
    setSelectedFeeStructure(null);
    setAmountDue("");
    setDiscount("");
    setDueDate("");
    setNotes("");
    setStudentQuery("");
    setShowStudentDropdown(false);
  }

  async function handleCreate() {
    if (!selectedStudent || !selectedFeeStructure || !amountDue) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          feeStructureId: selectedFeeStructure.id,
          amountDue: Number(amountDue),
          discount: discount ? Number(discount) : 0,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create invoice");
      }

      toast("Invoice created successfully");
      setShowModal(false);
      resetForm();
      fetchInvoices();
    } catch (err: any) {
      toast(err.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage student invoices and billing</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search invoices..."
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
            <p className="p-4 text-muted-foreground">No invoices found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Invoice #</th>
                    <th className="p-3 text-left font-medium">Amount</th>
                    <th className="p-3 text-left font-medium">Paid</th>
                    <th className="p-3 text-left font-medium">Balance</th>
                    <th className="p-3 text-left font-medium">Due Date</th>
                    <th className="p-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{inv.invoiceNumber}</td>
                      <td className="p-3">KES {inv.amountDue.toLocaleString()}</td>
                      <td className="p-3">KES {inv.amountPaid.toLocaleString()}</td>
                      <td className="p-3">KES {inv.balance.toLocaleString()}</td>
                      <td className="p-3">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-3">
                        <Badge className={statusColors[inv.status] ?? "bg-gray-100 text-gray-800"}>
                          {inv.status}
                        </Badge>
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
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Invoice</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
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
                      <button
                        key={s.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setSelectedStudent(s);
                          setStudentQuery("");
                          setShowStudentDropdown(false);
                        }}
                      >
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
                  onChange={(e) => {
                    const fs = feeStructures.find((f) => f.id === e.target.value);
                    if (fs) handleFeeStructureSelect(fs);
                  }}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select fee structure...</option>
                  {feeStructures.map((fs) => (
                    <option key={fs.id} value={fs.id}>
                      {fs.name} — KES {fs.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount Due (KES) *</label>
                  <input
                    type="number"
                    value={amountDue}
                    onChange={(e) => setAmountDue(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount (KES)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={!selectedStudent || !selectedFeeStructure || !amountDue || submitting}
              >
                {submitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
