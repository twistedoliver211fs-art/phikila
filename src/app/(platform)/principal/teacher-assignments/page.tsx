"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Assignment {
  id: string;
  staff_id: string;
  subject_id: string;
  class_id: string;
  staff: { first_name: string; last_name: string } | null;
  subjects: { name: string } | null;
  classes: { name: string; grades: { name: string } | null } | null;
}

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  grades: { name: string } | null;
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("school_members").select("school_id").eq("user_id", user.id).eq("is_active", true).limit(1).single().then(async ({ data: sm }) => {
        if (!sm) return;
        setSchoolId(sm.school_id);
        await loadData(sm.school_id);
      });
    });
  }, []);

  const loadData = async (sid: string) => {
    const supabase = createClient();

    const [assignmentsRes, teacherMembersRes, subjectsRes, classesRes] = await Promise.all([
      supabase
        .from("teacher_subject_assignments")
        .select("id, staff_id, subject_id, class_id, staff(first_name, last_name), subjects(name), classes(name, grades(name))")
        .eq("school_id", sid)
        .order("created_at", { ascending: false }),
      supabase
        .from("school_members")
        .select("user_id")
        .eq("school_id", sid)
        .eq("role", "teacher")
        .eq("is_active", true),
      supabase.from("subjects").select("id, name").eq("school_id", sid).order("name"),
      supabase.from("classes").select("id, name, grades(name)").eq("school_id", sid).order("name"),
    ]);

    setAssignments((assignmentsRes.data as unknown as Assignment[]) ?? []);

    const userIds = (teacherMembersRes.data ?? []).map((m: { user_id: string }) => m.user_id);
    const { data: staffList } = userIds.length > 0
      ? await supabase
          .from("staff")
          .select("id, first_name, last_name, user_id")
          .eq("school_id", sid)
          .in("user_id", userIds)
      : { data: [] };

    setStaff((staffList as unknown as StaffMember[]) ?? []);
    setSubjects((subjectsRes.data as unknown as Subject[]) ?? []);
    setClasses((classesRes.data as unknown as Class[]) ?? []);
    setLoading(false);
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterTeacher && a.staff_id !== filterTeacher) return false;
    if (filterSubject && a.subject_id !== filterSubject) return false;
    if (filterClass && a.class_id !== filterClass) return false;
    return true;
  });

  const uniqueTeachers = new Set(filteredAssignments.map((a) => a.staff_id)).size;
  const uniqueSubjects = new Set(filteredAssignments.map((a) => a.subject_id)).size;
  const uniqueClasses = new Set(filteredAssignments.map((a) => a.class_id)).size;

  const handleAdd = async () => {
    if (!schoolId || !selectedTeacher || !selectedSubject || !selectedClass) return;
    setError("");
    setSaving(true);
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("teacher_subject_assignments")
      .select("id")
      .eq("school_id", schoolId)
      .eq("staff_id", selectedTeacher)
      .eq("subject_id", selectedSubject)
      .eq("class_id", selectedClass)
      .limit(1);

    if (existing && existing.length > 0) {
      setError("This assignment already exists.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("teacher_subject_assignments")
      .insert({
        school_id: schoolId,
        staff_id: selectedTeacher,
        subject_id: selectedSubject,
        class_id: selectedClass,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setShowModal(false);
    setSelectedTeacher("");
    setSelectedSubject("");
    setSelectedClass("");
    setSaving(false);
    await loadData(schoolId);
  };

  const handleDelete = async (id: string) => {
    if (!schoolId) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("teacher_subject_assignments").delete().eq("id", id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  };

  const teacherName = (a: Assignment) => {
    if (a.staff) return `${a.staff.first_name} ${a.staff.last_name}`;
    return "—";
  };

  const subjectName = (a: Assignment) => a.subjects?.name ?? "—";

  const className = (a: Assignment) => {
    if (!a.classes) return "—";
    const grade = a.classes.grades?.name;
    return grade ? `${grade} ${a.classes.name}` : a.classes.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teacher Assignments</h1>
          <p className="text-muted-foreground mt-1">
            {filteredAssignments.length} assignments across {uniqueTeachers} teachers, {uniqueSubjects} subjects, {uniqueClasses} classes
          </p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />Add Assignment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        >
          <option value="">All Teachers</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
          ))}
        </select>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.grades?.name ? `${c.grades.name} ${c.name}` : c.name}</option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Teacher</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Subject</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Class</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : filteredAssignments.length > 0 ? (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                          <span className="text-xs font-bold text-indigo-700">
                            {a.staff?.first_name?.[0]}{a.staff?.last_name?.[0]}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{teacherName(a)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{subjectName(a)}</td>
                    <td className="p-4 text-muted-foreground">{className(a)}</td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(a.id)}
                        disabled={deleting === a.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No assignments found. Click &quot;Add Assignment&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Add Assignment</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                >
                  <option value="">Select teacher...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                >
                  <option value="">Select class...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.grades?.name ? `${c.grades.name} ${c.name}` : c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleAdd}
                disabled={!selectedTeacher || !selectedSubject || !selectedClass || saving}
              >
                {saving ? "Saving..." : "Add Assignment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}