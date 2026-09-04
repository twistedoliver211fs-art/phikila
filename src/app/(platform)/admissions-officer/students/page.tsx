"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Users, CheckCircle, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface StudentRegistration {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  parent_name: string;
  parent_phone: string;
  status: string;
  created_at: string;
  classes: { name: string; grades: { name: string } } | null;
}

interface ClassOption {
  id: string;
  name: string;
  grades: { name: string } | null;
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  active: { color: "bg-green-50 text-green-700", dot: "bg-green-500", label: "Active" },
  pending: { color: "bg-amber-50 text-amber-700", dot: "bg-amber-500", label: "Pending" },
  inactive: { color: "bg-gray-100 text-gray-600", dot: "bg-gray-400", label: "Inactive" },
};

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [students, setStudents] = useState<StudentRegistration[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sm } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!sm) return;
      setSchoolId(sm.school_id);

      const [studentsRes, classesRes] = await Promise.all([
        supabase
          .from("student_registrations")
          .select("id, admission_number, first_name, last_name, date_of_birth, gender, class_id, parent_name, parent_phone, status, created_at, classes(name, grades(name))")
          .eq("school_id", sm.school_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("classes")
          .select("id, name, grades(name)")
          .eq("school_id", sm.school_id)
          .order("name"),
      ]);

      setStudents(studentsRes.data as unknown as StudentRegistration[] ?? []);
      setClasses(classesRes.data as unknown as ClassOption[] ?? []);
      setLoading(false);
    };

    init();
  }, []);

  const filtered = students.filter((s) => {
    if (filterClass !== "all" && s.class_id !== filterClass) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      if (!name.includes(q) && !s.admission_number.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const total = students.length;
  const activeCount = students.filter((s) => s.status === "active").length;
  const pendingCount = students.filter((s) => s.status === "pending").length;

  const formatClassName = (c: StudentRegistration["classes"]) => {
    if (!c) return "—";
    return `${c.grades?.name ?? ""} ${c.name}`.trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Registration</h1>
          <p className="text-muted-foreground mt-1">Manage registered students</p>
        </div>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => router.push("/admissions-officer/students/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Register Student
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{total}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-xs text-green-600 uppercase tracking-wide">Active</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-xs text-amber-600 uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="relative">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="h-full appearance-none rounded-lg border border-border bg-card px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grades?.name ?? ""} {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-full appearance-none rounded-lg border border-border bg-card px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Admission</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Parent</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Phone</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length > 0 ? (
                filtered.map((s) => {
                  const config = statusConfig[s.status] ?? statusConfig.pending;
                  return (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-bold text-primary">
                              {s.first_name[0]}{s.last_name[0]}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">
                            {s.first_name} {s.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{s.admission_number}</td>
                      <td className="p-4 text-muted-foreground">{formatClassName(s.classes)}</td>
                      <td className="p-4 text-muted-foreground">{s.parent_name}</td>
                      <td className="p-4 text-muted-foreground">{s.parent_phone}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {loading ? "Loading students..." : "No students found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
