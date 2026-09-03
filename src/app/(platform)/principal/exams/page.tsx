"use client";

import { useEffect, useState } from "react";
import { Plus, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  created_at: string;
  term_id: string;
}

export default function PrincipalExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("school_members").select("school_id").eq("user_id", user.id).eq("is_active", true).limit(1).single().then(({ data: sm }) => {
        if (!sm) return;
        supabase.from("exams").select("*").eq("school_id", sm.school_id).order("created_at", { ascending: false }).then(({ data }) => {
          setExams(data ?? []);
          setLoading(false);
        });
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams & Results</h1>
          <p className="text-muted-foreground mt-1">Manage exams and view student performance</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Exam</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Exams</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No exams created yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first exam to start recording results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-medium text-muted-foreground">Exam</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{exam.name}</td>
                    <td className="p-4 text-muted-foreground">{exam.exam_date ?? "—"}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">View Results</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
