"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Phone, Mail, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const roles = [
  { value: "teacher", label: "Teacher" },
  { value: "principal", label: "Principal" },
  { value: "finance", label: "Finance" },
  { value: "admissions_officer", label: "Admissions Officer" },
  { value: "secretary", label: "Secretary" },
];

const roleColors: Record<string, string> = {
  teacher: "bg-blue-50 text-blue-700",
  secretary: "bg-purple-50 text-purple-700",
  finance: "bg-amber-50 text-amber-700",
  principal: "bg-green-50 text-green-700",
  admissions_officer: "bg-cyan-50 text-cyan-700",
};

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  role: string;
  department: string;
  is_active: boolean;
  user_id: string;
  school_members?: { role: string }[];
}

export default function PrincipalStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("school_members").select("school_id").eq("user_id", user.id).eq("is_active", true).limit(1).single().then(async ({ data: sm }) => {
        if (!sm) return;
        setSchoolId(sm.school_id);

        const { data } = await supabase
          .from("staff")
          .select("*, school_members(role)")
          .eq("school_id", sm.school_id)
          .order("last_name");

        setStaff(data ?? []);
        setLoading(false);
      });
    });
  }, []);

  const assignRole = async (staffId: string, userId: string, newRole: string) => {
    if (!schoolId || !userId) return;
    const supabase = createClient();

    const { error } = await supabase
      .from("school_members")
      .upsert(
        { user_id: userId, school_id: schoolId, role: newRole, is_active: true },
        { onConflict: "user_id,school_id,role" }
      );

    if (!error) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === staffId
            ? { ...s, role: newRole, school_members: [{ role: newRole }] }
            : s
        )
      );
    }
    setAssigningRole(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground mt-1">{staff.length} members — assign roles to control portal access</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Invite Staff</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <UserCog className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Role Assignment</p>
            <p className="text-xs text-muted-foreground mt-1">
              Assign roles to staff members to give them access to specific portals.
              The role determines which dashboard they see when they log in.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search staff..." className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Staff Member</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Department</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Current Role</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Portal Access</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : staff.length > 0 ? (
                staff.map((s) => {
                  const memberRole = s.school_members?.[0]?.role ?? s.role;
                  return (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-bold text-primary">{s.first_name[0]}{s.last_name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{s.first_name} {s.last_name}</p>
                            <p className="text-xs text-muted-foreground">{s.employee_number ?? "No employee #"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{s.department ?? "—"}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[memberRole] ?? "bg-gray-100 text-gray-600"}`}>
                          {memberRole.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground capitalize">
                        {memberRole.replace(/_/g, " ")} portal
                      </td>
                      <td className="p-4">
                        {assigningRole === s.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue={memberRole}
                              onChange={(e) => assignRole(s.id, s.user_id, e.target.value)}
                              className="rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {roles.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <Button variant="ghost" size="sm" onClick={() => setAssigningRole(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setAssigningRole(s.id)}>
                            <UserCog className="h-4 w-4 mr-1" />Change Role
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No staff found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
