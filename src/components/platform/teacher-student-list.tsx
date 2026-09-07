"use client";

import { useState } from "react";
import { Search, Mail, Phone } from "lucide-react";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  gender: string | null;
  parent_user_id: string | null;
  classes: { name: string; grades: { name: string }[] }[] | { name: string; grades: { name: string }[] } | null;
}

export function TeacherStudentList({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.admission_number.toLowerCase().includes(q)
    );
  });

  const getClassLabel = (classes: Student["classes"]) => {
    if (!classes) return "";
    const c = Array.isArray(classes) ? classes[0] : classes;
    if (!c) return "";
    const grade = c.grades?.[0]?.name ?? "";
    return `${grade} ${c.name}`.trim();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">{students.length} students in your classes</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((s) => (
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
                      {getClassLabel(s.classes)} · {s.admission_number}
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
                <a
                  href={`tel:${s.parent_user_id ?? ""}`}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors ${s.parent_user_id ? "text-foreground hover:bg-muted/50" : "text-muted-foreground/50 cursor-not-allowed"}`}
                >
                  <Phone className="h-3 w-3" />Call
                </a>
                <a
                  href={`mailto:${s.parent_user_id ?? ""}`}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors ${s.parent_user_id ? "text-foreground hover:bg-muted/50" : "text-muted-foreground/50 cursor-not-allowed"}`}
                >
                  <Mail className="h-3 w-3" />Email
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            {query ? "No students match your search." : "No students found in your assigned classes."}
          </div>
        )}
      </div>
    </div>
  );
}
