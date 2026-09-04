"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

interface Subject {
  name: string;
}

interface StaffRegistration {
  id: string;
  school_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  tsc_number: string | null;
  staff_type: string;
  status: string;
  created_at: string;
  staff_subject_assignments: { subjects: Subject }[];
}

type StatusFilter = "all" | "active" | "pending" | "inactive";

export default function StaffRegistrationListPage() {
  const [staffList, setStaffList] = useState<StaffRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);

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

  async function fetchStaff(sId: string) {
    const supabase = createClient();
    setLoading(true);
    const { data, error } = await supabase
      .from("staff_registrations")
      .select(
        `
        *,
        staff_subject_assignments (
          subjects ( name )
        )
      `
      )
      .eq("school_id", sId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStaffList(data as StaffRegistration[]);
    }
    setLoading(false);
  }

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      const matchesSearch =
        searchQuery === "" ||
        `${s.first_name} ${s.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [staffList, statusFilter, searchQuery]);

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === "active").length;
  const pendingStaff = staffList.filter((s) => s.status === "pending").length;

  function getSubjectsDisplay(staff: StaffRegistration): string {
    const subjects = staff.staff_subject_assignments?.map(
      (a) => a.subjects?.name
    ).filter(Boolean);
    if (!subjects || subjects.length === 0) return "—";
    if (subjects.length <= 2) return subjects.join(", ");
    return `${subjects[0]}, ${subjects[1]} +${subjects.length - 2}`;
  }

  function getStatusBadge(status: string) {
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full font-medium">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        Inactive
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Staff Registration
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Manage registered teaching staff
            </p>
          </div>
          <Link href="/admissions-officer/staff/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Register Staff
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalStaff}</p>
              <p className="text-sm text-slate-500">Total Staff</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {activeStaff}
              </p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {pendingStaff}
              </p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading staff...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No staff found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 font-medium text-slate-500">
                        Name
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">
                        Number
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">
                        Subjects
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">
                        TSC #
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">
                        Phone
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staff) => (
                      <tr
                        key={staff.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-slate-900">
                            {staff.first_name} {staff.last_name}
                          </span>
                          {staff.email && (
                            <span className="block text-xs text-slate-400 mt-0.5">
                              {staff.email}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                          {staff.employee_number}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs max-w-[160px] truncate">
                          {getSubjectsDisplay(staff)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {staff.tsc_number ?? (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs whitespace-nowrap">
                          {staff.phone}
                        </td>
                        <td className="px-5 py-3.5">
                          {getStatusBadge(staff.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredStaff.map((staff) => (
                  <div key={staff.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {staff.first_name} {staff.last_name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {staff.employee_number}
                        </p>
                      </div>
                      {getStatusBadge(staff.status)}
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>
                        <span className="text-slate-400">Phone:</span>{" "}
                        {staff.phone}
                      </p>
                      <p>
                        <span className="text-slate-400">TSC:</span>{" "}
                        {staff.tsc_number ?? "—"}
                      </p>
                      <p>
                        <span className="text-slate-400">Subjects:</span>{" "}
                        {getSubjectsDisplay(staff)}
                      </p>
                      {staff.email && (
                        <p>
                          <span className="text-slate-400">Email:</span>{" "}
                          {staff.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
