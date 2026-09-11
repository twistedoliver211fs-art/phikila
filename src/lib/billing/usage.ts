/**
 * Usage Service
 *
 * Tracks resource usage against subscription limits.
 * Usage is computed from actual database counts, not separate counters.
 */

import { createAdminClient } from "@/lib/supabase/server-admin";
import { getLimits } from "@/lib/billing/entitlements";
import { UsageLimitExceededError } from "@/lib/errors";

const UNLIMITED = -1;

/**
 * Get the current usage count for a resource.
 */
async function getResourceCount(
  schoolId: string,
  resource: "students" | "staff"
): Promise<number> {
  const admin = createAdminClient();

  const table = resource === "students" ? "students" : "staff";

  const { count, error } = await admin
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_active", true);

  if (error) {
    console.error(`[Usage] Error counting ${resource}:`, error);
    throw error;
  }

  return count ?? 0;
}

/**
 * Check if a school is within its usage limit for a resource.
 */
export async function checkLimit(
  schoolId: string,
  resource: "students" | "staff"
): Promise<{ current: number; limit: number; within: boolean }> {
  const limits = await getLimits(schoolId);
  const limit = limits[resource];
  const current = await getResourceCount(schoolId, resource);

  // -1 means unlimited
  const within = limit === UNLIMITED ? true : current < limit;

  return { current, limit, within };
}

/**
 * Require that a school is within its usage limit.
 * Throws UsageLimitExceededError if the limit has been reached.
 */
export async function requireWithinLimit(
  schoolId: string,
  resource: "students" | "staff"
): Promise<void> {
  const { current, limit, within } = await checkLimit(schoolId, resource);

  if (!within) {
    throw new UsageLimitExceededError(resource, current, limit);
  }
}

/**
 * Get full usage stats for a school.
 */
export async function getUsageStats(
  schoolId: string
): Promise<{
  students: { current: number; limit: number };
  staff: { current: number; limit: number };
}> {
  const limits = await getLimits(schoolId);
  const [studentCount, staffCount] = await Promise.all([
    getResourceCount(schoolId, "students"),
    getResourceCount(schoolId, "staff"),
  ]);

  return {
    students: { current: studentCount, limit: limits.students },
    staff: { current: staffCount, limit: limits.staff },
  };
}
