"use client";

import { useEffect, useState } from "react";
import { Search, Plus, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const roleOptions = [
  "Admin",
  "Bursar",
  "Librarian",
  "Cook",
  "Driver",
  "Security",
  "Cleaner",
  "Nurse",
  "Groundsman",
  "Mechanic",
  "Other",
];

const roleColors: Record<string, string> = {
  Admin: "bg-purple-50 text-purple-700",
  Bursar: "bg-amber-50 text-amber-700",
  Librarian: "bg-blue-50 text-blue-700",
  Cook: "bg-orange-50 text-orange-700",
  Driver: "bg-cyan-50 text-cyan-700",
  Security: "bg-red-50 text-red-700",
  Cleaner: "bg-teal-50 text-teal-700",
  Nurse: "bg-pink-50 text-pink-700",
  Groundsman: "bg-green-50 text-green-700",
  Mechanic: "bg-slate-50 text-slate-700",
  Other: "bg-gray-50 text-gray-700",
};

const statusConfig: Record<string, { dot: string; text: string }> = {
  active: { dot: "bg-green-500", text: "text-green-700" },
  pending: { dot: "bg-amber-500", text: "text-amber-700" },
  inactive: { dot: "bg-gray-400", text: "text-gray-500" },
};

interface StaffMember {
  id: string;
  school_id: string;
  staff_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
}

export default function NonTeachingStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "Cook",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single()
        .then(async ({ data: sm }) => {
          if (!sm) return;
          setSchoolId(sm.school_id);
          await fetchStaff(sm.school_id);
        });
    });
  }, []);

  const fetchStaff = async (sid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("non_teaching_staff")
      .select("*")
      .eq("school_id", sid)
      .order("created_at", { ascending: false });
    setStaff(data ?? []);
    setLoading(false);
  };

  const filtered = staff.filter((s) => {
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    const matchesSearch =
      !search ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      s.staff_number.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const total = staff.length;
  const active = staff.filter((s) => s.status === "active").length;
  const pending = staff.filter((s) => s.status === "pending").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !form.phone.trim()) return;
    setSubmitting(true);
    const supabase = createClient();

    const { count } = await supabase
      .from("non_teaching_staff")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId);

    const staffNumber = `NTS-${String((count ?? 0) + 1).padStart(3, "0")}`;

    const { error } = await supabase.from("non_teaching_staff").insert({
      school_id: schoolId,
      staff_number: staffNumber,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: "active",
    });

    if (!error) {
      setShowModal(false);
      setForm({ first_name: "", last_name: "", phone: "", role: "Cook" });
      await fetchStaff(schoolId);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Non-Teaching Staff</h1>
          <p className="text-muted-foreground mt-1">{total} registered staff members</p>
        </div>
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => setShowModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Register Staff
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{active}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-600">Pending</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pending}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, number, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="all">All Roles</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Number</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Phone</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((s) => {
                  const st = statusConfig[s.status] ?? statusConfig.active;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-bold text-primary">
                              {s.first_name[0]}{s.last_name[0]}
                            </span>
                          </div>
                          <p className="font-medium text-foreground">
                            {s.first_name} {s.last_name}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">
                        {s.staff_number}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[s.role] ?? roleColors.Other}`}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{s.phone ?? "—"}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                          <span className={st.text}>
                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    {staff.length === 0
                      ? "No non-teaching staff registered yet."
                      : "No staff match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && setShowModal(false)}
          />
          <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Register Non-Teaching Staff
              </h2>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g. Mary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g. Akinyi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. 0712345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
