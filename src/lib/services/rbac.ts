/**
 * RBAC V2 Service
 *
 * Granular permission system built on top of the existing role model.
 * Supports both built-in roles and school-defined custom roles.
 */

import { createAdminClient } from "@/lib/supabase/server-admin";
import { ForbiddenError } from "@/lib/errors";

/**
 * Check if a user has a specific permission in a school.
 * Uses the PostgreSQL has_permission() function which checks:
 *  1. Built-in role permissions
 *  2. Custom role permissions
 *  3. Super admin bypass
 */
export async function hasPermission(
  userId: string,
  schoolId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("has_permission", {
    p_user_id: userId,
    p_school_id: schoolId,
    p_resource: resource,
    p_action: action,
  });

  if (error) {
    console.error("[RBAC] Error checking permission:", error);
    return false;
  }

  return data === true;
}

/**
 * Require a specific permission. Throws ForbiddenError if denied.
 */
export async function requirePermission(
  userId: string,
  schoolId: string,
  resource: string,
  action: string
): Promise<void> {
  const allowed = await hasPermission(userId, schoolId, resource, action);
  if (!allowed) {
    throw new ForbiddenError(
      `Missing permission: ${resource}.${action}`
    );
  }
}

/**
 * Get all permissions for a user in a school.
 * Returns an array of "resource.action" strings.
 */
export async function getUserPermissions(
  userId: string,
  schoolId: string
): Promise<string[]> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("get_user_permissions", {
    p_user_id: userId,
    p_school_id: schoolId,
  });

  if (error) {
    console.error("[RBAC] Error getting permissions:", error);
    return [];
  }

  return data ?? [];
}
