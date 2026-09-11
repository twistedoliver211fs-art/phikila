import { createAdminClient } from "@/lib/supabase/server-admin";
import { cache } from "@/lib/cache";

export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  category: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface PlatformStats {
  totalSchools: number;
  activeSchools: number;
  totalUsers: number;
  activeSubscriptions: number;
  totalStudents: number;
  totalStaff: number;
  revenue: number;
}

export interface SchoolWithStats {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
  studentCount: number;
  staffCount: number;
  memberCount: number;
  createdAt: string;
}

function mapSetting(row: Record<string, unknown>): SystemSetting {
  return {
    id: row.id as string,
    key: row.key as string,
    value: row.value as unknown,
    description: row.description as string | null,
    category: row.category as string,
    isPublic: row.is_public as boolean,
    updatedAt: row.updated_at as string,
  };
}

export async function getSystemSettings(category?: string): Promise<SystemSetting[]> {
  const admin = createAdminClient();
  let query = admin.from("system_settings").select("*").order("category, key");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapSetting);
}

export async function updateSystemSetting(
  key: string,
  value: unknown,
  updatedBy?: string
): Promise<SystemSetting> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("system_settings")
    .update({
      value,
      updated_by: updatedBy ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;

  await cache.del("platform:stats");
  await cache.invalidatePattern("platform:*");

  return mapSetting(data);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return cache.getOrSet(
    "platform:stats",
    async () => {
      const admin = createAdminClient();

      const [schoolsResult, usersResult, subscriptionsResult, studentsResult, staffResult, paymentsResult] = await Promise.all([
        admin.from("schools").select("id, status", { count: "exact" }),
        admin.from("school_members").select("id", { count: "exact" }).eq("is_active", true),
        admin.from("subscriptions").select("id, status").in("status", ["active", "trialing"]),
        admin.from("students").select("id", { count: "exact" }).eq("is_active", true),
        admin.from("staff").select("id", { count: "exact" }),
        admin.from("payments").select("amount"),
      ]);

      const totalSchools = schoolsResult.count ?? 0;
      const activeSchools = (schoolsResult.data ?? []).filter((s) => s.status === "active").length;
      const totalUsers = usersResult.count ?? 0;
      const activeSubscriptions = subscriptionsResult.data?.length ?? 0;
      const totalStudents = studentsResult.count ?? 0;
      const totalStaff = staffResult.count ?? 0;
      const revenue = (paymentsResult.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        totalSchools,
        activeSchools,
        totalUsers,
        activeSubscriptions,
        totalStudents,
        totalStaff,
        revenue,
      };
    },
    { ttl: 60 }
  );
}

export async function getSchoolsWithStats(): Promise<SchoolWithStats[]> {
  const admin = createAdminClient();

  const { data: schools, error } = await admin
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const results: SchoolWithStats[] = [];

  for (const school of schools ?? []) {
    const [studentsResult, staffResult, membersResult] = await Promise.all([
      admin.from("students").select("id", { count: "exact" }).eq("school_id", school.id).eq("is_active", true),
      admin.from("staff").select("id", { count: "exact" }).eq("school_id", school.id),
      admin.from("school_members").select("id", { count: "exact" }).eq("school_id", school.id).eq("is_active", true),
    ]);

    results.push({
      id: school.id,
      name: school.name,
      slug: school.slug,
      status: school.status,
      subscriptionStatus: school.subscription_status,
      studentCount: studentsResult.count ?? 0,
      staffCount: staffResult.count ?? 0,
      memberCount: membersResult.count ?? 0,
      createdAt: school.created_at,
    });
  }

  return results;
}

export async function toggleMaintenanceMode(enabled: boolean): Promise<void> {
  await updateSystemSetting("maintenance_mode", enabled);
}
