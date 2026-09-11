/**
 * Audit Logging Service
 *
 * Append-only audit trail for all significant actions.
 * Supports both platform-level (school_id = null) and per-school logging.
 * Only the service-role client can write to audit_logs.
 */

import { createAdminClient } from "@/lib/supabase/server-admin";

export interface AuditEntry {
  schoolId?: string | null;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Write an audit log entry. Failures are logged but do not throw.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const admin = createAdminClient();

    const { error } = await admin.from("audit_logs").insert({
      school_id: entry.schoolId ?? null,
      actor_user_id: entry.userId ?? null,
      actor_email: entry.userEmail ?? null,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
    });

    if (error) {
      console.error("[Audit] Failed to write audit log:", entry.action, error);
    }
  } catch (err) {
    console.error("[Audit] Unexpected error writing audit log:", entry.action, err);
  }
}

export interface GetAuditLogsParams {
  schoolId?: string | null;
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Query audit logs with filtering.
 */
export async function getAuditLogs(params: GetAuditLogsParams): Promise<
  Array<{
    id: string;
    school_id: string | null;
    actor_user_id: string | null;
    actor_email: string | null;
    action: string;
    resource_type: string;
    resource_id: string | null;
    metadata: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
  }>
> {
  const admin = createAdminClient();

  let query = admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.schoolId !== undefined) {
    if (params.schoolId === null) {
      query = query.is("school_id", null);
    } else {
      query = query.eq("school_id", params.schoolId);
    }
  }

  if (params.userId) {
    query = query.eq("actor_user_id", params.userId);
  }

  if (params.action) {
    query = query.eq("action", params.action);
  }

  if (params.resourceType) {
    query = query.eq("resource_type", params.resourceType);
  }

  if (params.startDate) {
    query = query.gte("created_at", params.startDate.toISOString());
  }

  if (params.endDate) {
    query = query.lte("created_at", params.endDate.toISOString());
  }

  query = query.range(
    params.offset ?? 0,
    (params.offset ?? 0) + (params.limit ?? 50) - 1
  );

  const { data, error } = await query;

  if (error) {
    console.error("[Audit] Error fetching audit logs:", error);
    return [];
  }

  return data ?? [];
}
