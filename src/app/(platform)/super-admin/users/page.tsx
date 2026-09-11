"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
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
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface Member {
  id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  user_id: string;
  school_id: string;
  schools: { name: string }[] | null;
  auth_users: { email: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SchoolOption {
  id: string;
  name: string;
}

const ROLES = [
  "principal",
  "teacher",
  "finance",
  "admissions_officer",
  "secretary",
  "parent",
  "super_admin",
];

const ROLE_FILTERS = [
  { value: "", label: "All Roles" },
  ...ROLES.map((r) => ({ value: r, label: r.replace("_", " ") })),
];

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view: "users",
        page: pagination.page.toString(),
        limit: "50",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter) params.set("role", roleFilter);
      if (schoolFilter) params.set("school_id", schoolFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/platform?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setMembers(data.members ?? []);
      setPagination((p) => ({
        ...p,
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 0,
      }));
    } catch {
      console.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, debouncedSearch, roleFilter, schoolFilter, statusFilter]);

  const fetchSchools = useCallback(async () => {
    try {
      const res = await fetch("/api/platform?view=schools-list");
      if (res.ok) {
        const data = await res.json();
        setSchools(data.schools ?? []);
      }
    } catch {
      console.error("Failed to fetch schools");
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

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
    fetchMembers();
  }, [fetchMembers]);

  async function updateRole(memberId: string, newRole: string) {
    const res = await fetch("/api/admin/update-member", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, role: newRole }),
    });

    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setEditingId(null);
    }
  }

  async function toggleActive(memberId: string, currentActive: boolean) {
    const res = await fetch("/api/admin/update-member", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, isActive: !currentActive }),
    });

    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, is_active: !currentActive } : m
        )
      );
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member?")) return;

    const res = await fetch(`/api/admin/remove-member?memberId=${memberId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  }

  function toggleSelectAll() {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)));
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

  async function executeBulkAction(action: string, params?: Record<string, string>) {
    setBulkActionLoading(true);
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ids: Array.from(selectedIds),
          params,
        }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        await fetchMembers();
      }
    } finally {
      setBulkActionLoading(false);
    }
  }

  function showBulkConfirm(action: string, label: string, params?: Record<string, string>) {
    setConfirmDialog({
      open: true,
      title: `${label} ${selectedIds.size} user${selectedIds.size > 1 ? "s" : ""}?`,
      description: `This action will ${label.toLowerCase()} the selected users.`,
      onConfirm: () => {
        executeBulkAction(action, params);
        setConfirmDialog((d) => ({ ...d, open: false }));
      },
    });
  }

  const allSelected = members.length > 0 && selectedIds.size === members.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < members.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage roles and access for all users.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {members.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          –{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or school..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {ROLE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          value={schoolFilter}
          onChange={(e) => {
            setSchoolFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Schools</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
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
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="sm" variant="outline" disabled={bulkActionLoading} />
                }
              >
                Change Role
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Assign role</DropdownMenuLabel>
                {ROLES.map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => showBulkConfirm("bulk_change_role", `Change role to ${r.replace("_", " ")}`, { role: r })}
                  >
                    {r.replace("_", " ")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={() => showBulkConfirm("bulk_deactivate", "Deactivate")}
              disabled={bulkActionLoading}
            >
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => showBulkConfirm("bulk_remove", "Remove from School")}
              disabled={bulkActionLoading}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
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
                <th className="p-4 text-left font-medium text-muted-foreground">User ID</th>
                <th className="p-4 text-left font-medium text-muted-foreground">School</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Joined</th>
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
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${
                      selectedIds.has(member.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(member.id)}
                        onChange={() => toggleSelect(member.id)}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {member.user_id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      {member.schools?.[0]?.name ?? "—"}
                    </td>
                    <td className="p-4">
                      {editingId === member.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="rounded border border-border bg-background px-2 py-1 text-xs"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => updateRole(member.id, editRole)}
                            className="h-7 px-2 text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-7 px-2 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="capitalize">
                          {member.role.replace("_", " ")}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={member.is_active ? "default" : "outline"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString("en-US", {
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
                          onClick={() => {
                            setEditingId(member.id);
                            setEditRole(member.role);
                          }}
                          className="h-7 px-2"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleActive(member.id, member.is_active)}
                          className="h-7 px-2"
                        >
                          {member.is_active ? "Deactivate" : "Activate"}
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
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingId(member.id);
                                setEditRole(member.role);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleActive(member.id, member.is_active)}
                            >
                              {member.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
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
