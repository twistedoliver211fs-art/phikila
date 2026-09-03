import { Search, Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function TeacherStudentsPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", user?.id)
    .limit(1)
    .single();

  const { data: classTeachers } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("staff_id", staffRecord?.id ?? "00000000-0000-0000-0000-000000000000");

  const classIds = classTeachers?.map((ct) => ct.class_id) ?? [];

  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, admission_number, gender, parent_user_id, class_id, classes(name, grades(name))")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .in("class_id", classIds.length > 0 ? classIds : ["00000000-0000-0000-0000-000000000000"])
    .order("last_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">{students?.length ?? 0} students in your classes</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {students && students.length > 0 ? (
          students.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {s.first_name[0]}{s.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {s.first_name} {s.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(s.classes as any)?.grades?.name ?? ""} {(s.classes as any)?.name ?? ""} · {s.admission_number}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium text-foreground capitalize">{s.gender ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parent</p>
                  <p className="font-medium text-foreground">{s.parent_user_id ? "Linked" : "Not linked"}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                  <Phone className="h-3 w-3" />Call
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                  <Mail className="h-3 w-3" />Email
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No students found in your assigned classes.
          </div>
        )}
      </div>
    </div>
  );
}
