import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { OnboardingWizard, type SetupState } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const schoolId = await getCurrentSchoolId();
  if (!schoolId) redirect("/no-access");

  const { data: membership } = await supabase
    .from("school_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .in("role", ["principal", "super_admin"])
    .maybeSingle();
  if (!membership) redirect("/dashboard");

  const [yearRes, gradeRes, subjectRes, periodRes, feeRes, schoolRes] = await Promise.all([
    supabase.from("academic_years").select("id").eq("school_id", schoolId).limit(1),
    supabase.from("grades").select("id").eq("school_id", schoolId).limit(1),
    supabase.from("subjects").select("id").eq("school_id", schoolId).limit(1),
    supabase.from("periods").select("id").eq("school_id", schoolId).limit(1),
    supabase.from("fee_structures").select("id").eq("school_id", schoolId).limit(1),
    supabase.from("schools").select("name, education_level").eq("id", schoolId).single(),
  ]);

  const state: SetupState = {
    hasAcademicYear: (yearRes.data?.length ?? 0) > 0,
    hasGrades: (gradeRes.data?.length ?? 0) > 0,
    hasSubjects: (subjectRes.data?.length ?? 0) > 0,
    hasPeriods: (periodRes.data?.length ?? 0) > 0,
    hasFees: (feeRes.data?.length ?? 0) > 0,
  };

  return (
    <OnboardingWizard
      schoolName={schoolRes.data?.name ?? "your school"}
      educationLevel={schoolRes.data?.education_level ?? "junior_senior"}
      state={state}
    />
  );
}
