import { Bell, MessageSquare, Calendar, Users, FileText, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function SecretaryPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, created_at, is_published")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, subject, content, is_read, created_at, sender_id")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: staff } = await supabase
    .from("staff")
    .select("id, first_name, last_name, role, department")
    .eq("school_id", schoolId)
    .eq("is_active", true);

  const { count: studentCount } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_active", true);

  const unreadMessages = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Secretary Dashboard</h1>
        <p className="text-muted-foreground mt-1">Communications, announcements, and office tasks</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Megaphone className="h-4 w-4" />
            <span className="text-xs font-medium">Announcements</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{announcements?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">Unread Messages</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{unreadMessages}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Staff</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{staff?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Students</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{studentCount ?? 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <Megaphone className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">New Announcement</span>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Send Message</span>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Schedule Event</span>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Generate Report</span>
          </button>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Recent Announcements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Title</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {announcements && announcements.length > 0 ? (
                announcements.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{a.title}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${a.is_published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {a.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No announcements yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Directory */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Staff Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Department</th>
              </tr>
            </thead>
            <tbody>
              {staff && staff.length > 0 ? (
                staff.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{s.first_name} {s.last_name}</td>
                    <td className="p-4 text-muted-foreground capitalize">{s.role.replace(/_/g, " ")}</td>
                    <td className="p-4 text-muted-foreground">{s.department ?? "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No staff found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
