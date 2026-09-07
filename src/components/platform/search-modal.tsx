"use client";

import { useEffect, useState } from "react";
import { Search, GraduationCap, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  type: "student" | "staff";
  name: string;
  detail: string;
}

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
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
            const q = query.toLowerCase();

            const [studentsRes, staffRes] = await Promise.all([
              supabase
                .from("students")
                .select("id, first_name, last_name, admission_number")
                .eq("school_id", sm.school_id)
                .eq("is_active", true)
                .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,admission_number.ilike.%${q}%`)
                .limit(5),
              supabase
                .from("staff")
                .select("id, first_name, last_name, employee_number")
                .eq("school_id", sm.school_id)
                .eq("is_active", true)
                .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
                .limit(5),
            ]);

            const combined: SearchResult[] = [
              ...(studentsRes.data ?? []).map((s) => ({
                id: s.id,
                type: "student" as const,
                name: `${s.first_name} ${s.last_name}`,
                detail: `Student · ${s.admission_number}`,
              })),
              ...(staffRes.data ?? []).map((s) => ({
                id: s.id,
                type: "staff" as const,
                name: `${s.first_name} ${s.last_name}`,
                detail: `Staff · ${s.employee_number ?? ""}`,
              })),
            ];

            setResults(combined);
            setLoading(false);
          });
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search students and staff..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((r) => (
                <div
                  key={`${r.type}-${r.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={onClose}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    {r.type === "student" ? (
                      <GraduationCap className="h-4 w-4 text-primary" />
                    ) : (
                      <Users className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
