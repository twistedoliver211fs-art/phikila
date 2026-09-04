"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

export default function RegisterStaffPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    tsc_number: "",
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
          await fetchSubjects(sm.school_id);
        });
    });
  }, []);

  async function fetchSubjects(sId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("school_id", sId)
      .order("name");

    if (!error && data) {
      setSubjects(data);
    }
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleSubject(subjectId: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId) return;

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (selectedSubjects.length === 0) {
      setError("Select at least one subject.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    try {
      // Generate employee number
      const { count } = await supabase
        .from("staff_registrations")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId);

      const employeeNumber = `TCH-${String((count ?? 0) + 1).padStart(3, "0")}`;

      // Insert staff registration
      const { data: registration, error: regError } = await supabase
        .from("staff_registrations")
        .insert({
          school_id: schoolId,
          employee_number: employeeNumber,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim(),
          tsc_number: form.tsc_number.trim() || null,
          staff_type: "teaching",
          status: "active",
        })
        .select("id")
        .single();

      if (regError) throw regError;

      // Insert subject assignments
      const subjectInserts = selectedSubjects.map((subjectId) => ({
        staff_registration_id: registration.id,
        subject_id: subjectId,
      }));

      const { error: subError } = await supabase
        .from("staff_subject_assignments")
        .insert(subjectInserts);

      if (subError) throw subError;

      // Insert into staff table for timetable compatibility
      const { error: staffError } = await supabase.from("staff").insert({
        school_id: schoolId,
        employee_number: employeeNumber,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        role: "teacher",
        is_active: true,
      });

      if (staffError) throw staffError;

      router.push("/admissions-officer/staff");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/admissions-officer/staff"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff List
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Register Teaching Staff
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Add a new staff member to your school
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading subjects...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-base font-semibold text-slate-900 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      First Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Last Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g. Mwangi"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Email{" "}
                      <span className="text-slate-400 text-xs font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g. 0712345678"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="tsc_number"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      TSC Number{" "}
                      <span className="text-slate-400 text-xs font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="tsc_number"
                      name="tsc_number"
                      type="text"
                      value={form.tsc_number}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g. 123456"
                    />
                  </div>
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <h2 className="text-base font-semibold text-slate-900 mb-1">
                  Subjects This Teacher Can Teach
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Select at least one subject
                </p>
                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    No subjects found. Add subjects first.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {subjects.map((subject) => {
                      const checked = selectedSubjects.includes(subject.id);
                      return (
                        <label
                          key={subject.id}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                            checked
                              ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSubject(subject.id)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{subject.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <Link href="/admissions-officer/staff">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {submitting ? "Registering..." : "Register Staff"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
