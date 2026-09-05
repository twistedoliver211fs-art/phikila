"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { School, Search, CheckCircle, XCircle, CreditCard } from "lucide-react";

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

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  async function fetchSchools() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("schools")
      .select("id, name, slug, status, subscription_status, school_type, education_level, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch schools:", error);
      setLoading(false);
      return;
    }

    // Get member counts
    const schoolIds = (data ?? []).map((s) => s.id);
    const { data: memberCounts } = await supabase
      .from("school_members")
      .select("school_id")
      .in("school_id", schoolIds)
      .eq("is_active", true);

    const counts: Record<string, number> = {};
    (memberCounts ?? []).forEach((m) => {
      counts[m.school_id] = (counts[m.school_id] || 0) + 1;
    });

    setSchools(
      (data ?? []).map((s) => ({
        ...s,
        member_count: counts[s.id] || 0,
      }))
    );
    setLoading(false);
  }

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

  const filtered = schools.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.status.includes(q) ||
      s.school_type.includes(q)
    );
  });

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
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search schools..."
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
                <th className="p-4 text-left font-medium text-muted-foreground">School</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Type</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Subscription</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Members</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No schools found.
                  </td>
                </tr>
              ) : (
                filtered.map((school) => (
                  <tr
                    key={school.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.slug}</p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground capitalize">
                      {school.school_type}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          school.status === "active"
                            ? "bg-green-50 text-green-700"
                            : school.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : school.status === "suspended"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          school.subscription_status === "active"
                            ? "bg-green-50 text-green-700"
                            : school.subscription_status === "trial"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {school.subscription_status}
                      </span>
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
                        {school.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateSchool(school.id, { status: "active" })}
                              className="h-7 px-2 text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateSchool(school.id, { status: "suspended" })}
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {school.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateSchool(school.id, { status: "suspended" })}
                            className="h-7 px-2 text-red-600 hover:text-red-700"
                          >
                            Suspend
                          </Button>
                        )}
                        {school.status === "suspended" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateSchool(school.id, { status: "active" })}
                            className="h-7 px-2 text-green-600 hover:text-green-700"
                          >
                            Reactivate
                          </Button>
                        )}
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
