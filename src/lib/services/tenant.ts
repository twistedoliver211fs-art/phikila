/**
 * Tenant Context Service
 *
 * Resolves the active school for a user and validates school access.
 * Every sensitive operation must call requireSchoolContext() to ensure
 * the user is operating within a valid school context.
 */

import { createAdminClient } from "@/lib/supabase/server-admin";
import { TenantAccessError } from "@/lib/errors";
import { cache } from "@/lib/cache";

export interface SchoolContext {
  schoolId: string;
  role: string;
  isActive: boolean;
}

/**
 * Get the current user's school context.
 * Returns null if the user has no active school membership.
 */
export async function getSchoolContext(userId: string): Promise<SchoolContext | null> {
  return cache.getOrSet(
    `tenant:context:${userId}`,
    async () => {
      const admin = createAdminClient();

      // First try active_school_id from profiles
      const { data: profile } = await admin
        .from("profiles")
        .select("active_school_id")
        .eq("id", userId)
        .single();

      if (profile?.active_school_id) {
        const { data: member } = await admin
          .from("school_members")
          .select("school_id, role, is_active")
          .eq("user_id", userId)
          .eq("school_id", profile.active_school_id)
          .eq("is_active", true)
          .single();

        if (member) {
          return {
            schoolId: member.school_id,
            role: member.role,
            isActive: member.is_active,
          };
        }
      }

      // Fallback: get the first active membership
      const { data: member } = await admin
        .from("school_members")
        .select("school_id, role, is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("joined_at", { ascending: true })
        .limit(1)
        .single();

      if (!member) return null;

      // Auto-set active_school_id for future calls
      await admin
        .from("profiles")
        .update({ active_school_id: member.school_id })
        .eq("id", userId);

      return {
        schoolId: member.school_id,
        role: member.role,
        isActive: member.is_active,
      };
    },
    { ttl: 300 }
  );
}

/**
 * Require a valid school context. Throws if the user has no active school.
 */
export async function requireSchoolContext(userId: string): Promise<SchoolContext> {
  const ctx = await getSchoolContext(userId);
  if (!ctx) {
    throw new TenantAccessError("No active school membership found");
  }
  return ctx;
}

/**
 * Set the user's active school. Validates that the user belongs to the school.
 */
export async function setActiveSchool(
  userId: string,
  schoolId: string
): Promise<void> {
  const admin = createAdminClient();

  const { data: member, error } = await admin
    .from("school_members")
    .select("school_id")
    .eq("user_id", userId)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .single();

  if (error || !member) {
    throw new TenantAccessError("You do not have access to this school");
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ active_school_id: schoolId })
    .eq("id", userId);

  if (updateError) {
    throw new Error("Failed to set active school");
  }

  await cache.del(`tenant:context:${userId}`);
}

/**
 * Validate that a user has access to a specific school.
 */
export async function validateSchoolAccess(
  userId: string,
  schoolId: string
): Promise<boolean> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("school_members")
    .select("school_id")
    .eq("user_id", userId)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .limit(1)
    .single();

  return !!data;
}
