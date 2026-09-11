import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import {
  PLAN_LIMITS,
  getNextTier,
  getUsageColor,
  getUsageLabel,
  type PlanTier,
  type CapacityMetric,
} from "@/lib/capacity-config";
import { ForbiddenError } from "@/lib/errors";
import { cache } from "@/lib/cache";

async function requireSuperAdmin(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
) {
  const { data } = await supabase.rpc("is_super_admin");
  if (!data) throw new ForbiddenError("Super admin access required");
}

const TRACKED_TABLES = [
  "schools",
  "school_members",
  "students",
  "staff",
  "attendance_records",
  "exams",
  "payments",
  "invoices",
] as const;

export const GET = createRoute(async ({ supabase }) => {
  await requireSuperAdmin(supabase);

  const data = await cache.getOrSet(
    "platform:capacity",
    async () => {
      const admin = createAdminClient();

      const rowCounts: Record<string, number> = {};
      for (const table of TRACKED_TABLES) {
        const { count } = await admin
          .from(table)
          .select("id", { count: "exact", head: true });
        rowCounts[table] = count ?? 0;
      }

      const totalSchools = rowCounts["schools"] ?? 0;
      const totalUsers = rowCounts["school_members"] ?? 0;
      const totalStudents = rowCounts["students"] ?? 0;

      let dbSizeBytes = 0;
      try {
        const { data } = await admin.rpc("exec_sql", {
          query: "SELECT pg_database_size(current_database()) as bytes",
        });
        if (data && typeof data === "object" && "bytes" in data) {
          dbSizeBytes = Number((data as Record<string, unknown>).bytes) || 0;
        }
      } catch {
        dbSizeBytes =
          (totalSchools * 5 + totalUsers * 0.5 + totalStudents * 0.3) *
          1024 *
          1024;
      }

      const currentPlan: PlanTier = "free";
      const limits = PLAN_LIMITS[currentPlan];
      const nextTier = getNextTier(currentPlan);
      const nextTierLimits = nextTier ? PLAN_LIMITS[nextTier] : null;

      const dbSizeMB = dbSizeBytes / (1024 * 1024);
      const dbPercent = Math.min(
        100,
        Math.round((dbSizeMB / limits.databaseSizeMB) * 100)
      );

      const estimatedApiReqs = totalSchools * 10 + totalUsers * 2;
      const apiPercent = Math.min(
        100,
        Math.round((estimatedApiReqs / limits.apiRequestsPerMin) * 100)
      );

      const estimatedConnections = Math.min(
        limits.connections,
        Math.round(totalSchools * 2 + totalUsers * 0.1)
      );
      const connPercent = Math.min(
        100,
        Math.round((estimatedConnections / limits.connections) * 100)
      );

      const metrics: CapacityMetric[] = [
        {
          label: "Database",
          used: Math.round(dbSizeMB * 10) / 10,
          limit: limits.databaseSizeMB,
          unit: "MB",
          percent: dbPercent,
          color: getUsageColor(dbPercent),
          status: getUsageLabel(dbPercent),
        },
        {
          label: "API Requests",
          used: estimatedApiReqs,
          limit: limits.apiRequestsPerMin,
          unit: "req/min",
          percent: apiPercent,
          color: getUsageColor(apiPercent),
          status: getUsageLabel(apiPercent),
        },
        {
          label: "Connections",
          used: estimatedConnections,
          limit: limits.connections,
          unit: "",
          percent: connPercent,
          color: getUsageColor(connPercent),
          status: getUsageLabel(connPercent),
        },
      ];

      return {
        plan: currentPlan,
        planLimits: limits,
        nextTier,
        nextTierLimits,
        metrics,
        schools: {
          total: totalSchools,
          limit: currentPlan === "free" ? 100 : currentPlan === "pro" ? 10000 : 999999,
        },
        users: {
          total: totalUsers,
          limit: currentPlan === "free" ? 50000 : currentPlan === "pro" ? 5000000 : 99999999,
        },
        students: {
          total: totalStudents,
          limit: currentPlan === "free" ? 100000 : currentPlan === "pro" ? 10000000 : 999999999,
        },
        rowCounts,
      };
    },
    { ttl: 60 }
  );

  return NextResponse.json(data);
});
