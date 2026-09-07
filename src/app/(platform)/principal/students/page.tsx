import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { StudentTable } from "@/components/platform/student-table";

export default async function PrincipalStudentsPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, admission_number, gender, is_active, class_id, classes(name, grades(name))")
    .eq("school_id", schoolId)
    .order("last_name");

  return <StudentTable students={students ?? []} />;
}
