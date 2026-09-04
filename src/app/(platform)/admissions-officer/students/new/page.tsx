"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface ClassOption {
  id: string;
  name: string;
  grades: { name: string } | null;
}

interface GradeGroup {
  gradeName: string;
  classes: ClassOption[];
}

export default function RegisterStudentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [classGroups, setClassGroups] = useState<GradeGroup[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("male");
  const [classId, setClassId] = useState("");
  const [stream, setStream] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");

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

      const { data: classes } = await supabase
        .from("classes")
        .select("id, name, grades(name)")
        .eq("school_id", sm.school_id)
        .order("name");

      const grouped: Record<string, ClassOption[]> = {};
      for (const c of classes ?? []) {
        const gradeObj = c.grades as unknown as { name: string } | null;
        const gradeName = gradeObj?.name ?? "Other";
        if (!grouped[gradeName]) grouped[gradeName] = [];
        grouped[gradeName].push({ id: c.id, name: c.name, grades: gradeObj });
      }

      const groups: GradeGroup[] = Object.entries(grouped).map(([gradeName, cls]) => ({
        gradeName,
        classes: cls,
      }));

      setClassGroups(groups);
      if (groups.length > 0 && groups[0].classes.length > 0) {
        setClassId(groups[0].classes[0].id);
        setStream(groups[0].classes[0].name);
      }
      setLoading(false);
    };

    init();
  }, []);

  const handleClassChange = (selectedClassId: string) => {
    setClassId(selectedClassId);
    for (const group of classGroups) {
      const found = group.classes.find((c) => c.id === selectedClassId);
      if (found) {
        setStream(found.name);
        break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !firstName || !lastName || !classId || !parentName || !parentPhone) return;

    setSubmitting(true);

    try {
      const { count } = await supabase
        .from("student_registrations")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId);

      const admissionNumber = `STD-${String((count ?? 0) + 1).padStart(4, "0")}`;

      const registrationData = {
        school_id: schoolId,
        admission_number: admissionNumber,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        gender,
        class_id: classId,
        parent_name: parentName,
        parent_phone: parentPhone,
        parent_email: parentEmail || null,
        previous_school: previousSchool || null,
        status: "active",
      };

      const { error: regError } = await supabase
        .from("student_registrations")
        .insert(registrationData);

      if (regError) throw regError;

      const { error: studentError } = await supabase
        .from("students")
        .insert({
          school_id: schoolId,
          admission_number: admissionNumber,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth || null,
          gender,
          class_id: classId,
          is_active: true,
        });

      if (studentError) throw studentError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/admissions-officer/students");
      }, 1500);
    } catch (err) {
      console.error("Registration failed:", err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Student Registered Successfully</h2>
        <p className="text-muted-foreground">Redirecting to student list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admissions-officer/students")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Register Student</h1>
          <p className="text-muted-foreground mt-1">Add a new student to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Student Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Mary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Wanjiku"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Class/Level *</label>
              <select
                required
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {classGroups.map((group) => (
                  <optgroup key={group.gradeName} label={group.gradeName}>
                    {group.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {group.gradeName} {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Stream</label>
              <input
                type="text"
                readOnly
                value={stream}
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Parent/Guardian Information</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Parent Name *</label>
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. Jane Wanjiku"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Parent Phone *</label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. 0712345678"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Parent Email</label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="optional"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Previous School</label>
            <input
              type="text"
              value={previousSchool}
              onChange={(e) => setPreviousSchool(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="optional"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Student"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admissions-officer/students")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
