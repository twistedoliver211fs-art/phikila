"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, CreditCard, TrendingUp, Plus, Search } from "lucide-react";

interface StudentAccount {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  partial: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cleared: "bg-green-100 text-green-800",
};

export default function FeesDashboardPage() {
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/student-accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.studentAccounts ?? []);
        }
      } catch {
        console.error("Failed to fetch student accounts");
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  const totalExpected = accounts.reduce((sum, a) => sum + a.totalDue, 0);
  const totalCollected = accounts.reduce((sum, a) => sum + a.totalPaid, 0);
  const totalOutstanding = accounts.reduce((sum, a) => sum + a.balance, 0);
  const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : "0";

  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.studentName.toLowerCase().includes(q) ||
      a.className.toLowerCase().includes(q)
    );
  });

  const outstandingStudents = filtered.filter((a) => a.balance > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fees & Finance</h1>
          <p className="text-muted-foreground">Manage student fees, invoices, and payments</p>
        </div>
        <Link href="/principal/invoices">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalExpected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{accounts.length} students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES {totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{collectionRate}% collection rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">KES {totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalOutstanding > 0 ? "Has outstanding" : "All clear"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Balances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : outstandingStudents.length === 0 ? (
            <p className="p-4 text-muted-foreground">
              {accounts.length === 0 ? "No student accounts found." : "All balances are cleared."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Student</th>
                    <th className="p-3 text-left font-medium">Class</th>
                    <th className="p-3 text-left font-medium">Total Due</th>
                    <th className="p-3 text-left font-medium">Total Paid</th>
                    <th className="p-3 text-left font-medium">Balance</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {outstandingStudents.map((a) => {
                    const status = a.balance <= 0 ? "cleared" : a.totalPaid > 0 ? "partial" : "pending";
                    return (
                      <tr key={a.id} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="p-3 font-medium">{a.studentName}</td>
                        <td className="p-3 text-muted-foreground">{a.className}</td>
                        <td className="p-3">KES {a.totalDue.toLocaleString()}</td>
                        <td className="p-3">KES {a.totalPaid.toLocaleString()}</td>
                        <td className="p-3 font-medium">KES {a.balance.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge className={statusColors[status] ?? "bg-gray-100 text-gray-800"}>
                            {status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Link href={`/principal/invoices?student=${a.studentId}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
