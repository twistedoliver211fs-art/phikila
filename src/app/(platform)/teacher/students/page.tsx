import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { TeacherStudentList } from "@/components/platform/teacher-student-list";

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

  return <TeacherStudentList students={students ?? []} />;
}
