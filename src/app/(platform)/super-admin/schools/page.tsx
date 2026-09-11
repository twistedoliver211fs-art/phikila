"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  School,
  Search,
  CheckCircle,
  XCircle,
  LogIn,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  Trash2,
} from "lucide-react";

interface SchoolRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscription_status: string;
  school_type: string;
  education_level: string;
  created_at: string;
  member_count?: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
];

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [enterError, setEnterError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view: "schools",
        page: pagination.page.toString(),
        limit: "50",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/platform?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setSchools(data.schools ?? []);
      setPagination((p) => ({
        ...p,
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 0,
      }));
    } catch {
      console.error("Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, debouncedSearch, statusFilter]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  async function updateSchool(
    schoolId: string,
    updates: { status?: string; subscriptionStatus?: string }
  ) {
    const res = await fetch("/api/admin/update-school", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId,
        status: updates.status,
        subscriptionStatus: updates.subscriptionStatus,
      }),
    });

    if (res.ok) {
      setSchools((prev) =>
        prev.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                status: updates.status ?? s.status,
                subscription_status: updates.subscriptionStatus ?? s.subscription_status,
              }
            : s
        )
      );
    }
  }

  async function enterSchool(schoolId: string) {
    if (enteringId) return;
    setEnteringId(schoolId);
    setEnterError("");

    try {
      const res = await fetch("/api/auth/set-active-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, role: "principal" }),
      });

      const data = await res.json();

      if (!res.ok || !data.redirectTo) {
        setEnterError(data.error || "Failed to enter school");
        setEnteringId(null);
        return;
      }

      window.location.href = data.redirectTo;
    } catch {
      setEnterError("Network error. Please try again.");
      setEnteringId(null);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.size === schools.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(schools.map((s) => s.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function executeBulkAction(action: string) {
    setBulkActionLoading(true);
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ids: Array.from(selectedIds),
        }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        await fetchSchools();
      }
    } finally {
      setBulkActionLoading(false);
    }
  }

  function showBulkConfirm(action: string, label: string) {
    setConfirmDialog({
      open: true,
      title: `${label} ${selectedIds.size} school${selectedIds.size > 1 ? "s" : ""}?`,
      description: `This action cannot be undone. The selected schools will be ${label.toLowerCase()}.`,
      onConfirm: () => {
        executeBulkAction(action);
        setConfirmDialog((d) => ({ ...d, open: false }));
      },
    });
  }

  const allSelected = schools.length > 0 && selectedIds.size === schools.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < schools.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <School className="h-6 w-6" />
            School Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all registered schools.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {schools.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          –{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} schools
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, slug, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1.5 rounded-lg border border-border bg-card p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => showBulkConfirm("bulk_approve", "Approve")}
              disabled={bulkActionLoading}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => showBulkConfirm("bulk_suspend", "Suspend")}
              disabled={bulkActionLoading}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Suspend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => showBulkConfirm("bulk_reject", "Reject")}
              disabled={bulkActionLoading}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => showBulkConfirm("bulk_delete", "Delete")}
              disabled={bulkActionLoading}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto"
          >
            Clear
          </Button>
        </div>
      )}

      {enterError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">{enterError}</p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                </th>
                <th className="p-4 text-left font-medium text-muted-foreground">School</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Slug</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Students</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Created</th>
                <th className="p-4 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No schools found.
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr
                    key={school.id}
                    className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${
                      selectedIds.has(school.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(school.id)}
                        onChange={() => toggleSelect(school.id)}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <Link
                          href={`/super-admin/schools/${school.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {school.name}
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize">{school.school_type}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {school.slug}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          school.status === "active"
                            ? "default"
                            : school.status === "pending"
                            ? "secondary"
                            : school.status === "suspended"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {school.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {school.member_count ?? 0}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(school.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => enterSchool(school.id)}
                          disabled={enteringId !== null}
                          className="h-7 px-2 text-primary hover:text-primary"
                        >
                          <LogIn className="h-3.5 w-3.5 mr-1" />
                          {enteringId === school.id ? "Entering..." : "Enter"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button size="icon-sm" variant="ghost" className="h-7 w-7" />
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {school.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => updateSchool(school.id, { status: "active" })}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => updateSchool(school.id, { status: "rejected" })}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {school.status === "active" && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => updateSchool(school.id, { status: "suspended" })}
                              >
                                <XCircle className="h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {school.status === "suspended" && (
                              <DropdownMenuItem
                                onClick={() => updateSchool(school.id, { status: "active" })}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => enterSchool(school.id)}>
                              <LogIn className="h-4 w-4" />
                              Enter School
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
              const pageNum = start + i;
              if (pageNum > pagination.totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={pageNum === pagination.page ? "default" : "outline"}
                  onClick={() => setPagination((p) => ({ ...p, page: pageNum }))}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
          />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">{confirmDialog.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{confirmDialog.description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDialog.onConfirm}
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
