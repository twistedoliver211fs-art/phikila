"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, Search, Trash2, Edit2, ChevronDown } from "lucide-react";

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

const ROLES = [
  "principal",
  "teacher",
  "finance",
  "admissions_officer",
  "secretary",
  "parent",
  "super_admin",
];

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("school_members")
      .select("id, role, is_active, joined_at, user_id, school_id, schools(name)")
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch members:", error);
      setLoading(false);
      return;
    }

    // Fetch user emails separately (auth.users is not accessible via client)
    const userIds = (data ?? []).map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from("school_members")
      .select("user_id")
      .in("user_id", userIds);

    // We can't join auth.users from client, so we'll show user_id truncated
    setMembers(
      (data ?? []).map((m) => ({
        ...m,
        auth_users: null,
      }))
    );
    setLoading(false);
  }

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

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
                      m.role.includes(q) ||
                      m.schools?.[0]?.name?.toLowerCase().includes(q) ||
                      m.user_id.toLowerCase().includes(q)
    );
  });

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
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by role or school..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
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
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
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
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                          {member.role.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMember(member.id)}
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
