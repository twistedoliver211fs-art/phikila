import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function SecretaryAnnouncementsPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, is_published, created_at, profiles:author_id(full_name)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground mt-1">{announcements?.length ?? 0} announcements</p>
      </div>

      <div className="space-y-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((a: any) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-foreground">{a.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {a.profiles?.full_name ?? "Unknown"} — {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ml-3 ${a.is_published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {a.is_published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No announcements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
