/**
 * Domain Events Service
 *
 * Centralized event emission for all state changes.
 * Events are stored in the domain_events table and can be consumed by
 * audit logging, notifications, analytics, and workflow automation.
 */

import { createAdminClient } from "@/lib/supabase/server-admin";

export interface DomainEvent {
  type: string;
  schoolId: string | null;
  userId?: string;
  resourceType: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Emit a domain event. Writes to the domain_events table via service-role client.
 * Failures are logged but do not throw — event emission should never block the caller.
 */
export async function emitEvent(event: DomainEvent): Promise<void> {
  try {
    const admin = createAdminClient();

    const { error } = await admin.from("domain_events").insert({
      event_type: event.type,
      school_id: event.schoolId,
      actor_user_id: event.userId ?? null,
      resource_type: event.resourceType,
      resource_id: event.resourceId ?? null,
      payload: event.payload ?? {},
      metadata: event.metadata ?? {},
    });

    if (error) {
      console.error("[Events] Failed to emit event:", event.type, error);
    }
  } catch (err) {
    console.error("[Events] Unexpected error emitting event:", event.type, err);
  }
}

export interface GetEventsParams {
  schoolId: string;
  eventType?: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get events for a school, with optional filtering.
 */
export async function getEvents(params: GetEventsParams): Promise<
  Array<{
    id: string;
    event_type: string;
    school_id: string;
    actor_user_id: string | null;
    resource_type: string;
    resource_id: string | null;
    payload: Record<string, unknown>;
    metadata: Record<string, unknown>;
    created_at: string;
  }>
> {
  const admin = createAdminClient();

  let query = admin
    .from("domain_events")
    .select("*")
    .eq("school_id", params.schoolId)
    .order("created_at", { ascending: false });

  if (params.eventType) {
    query = query.eq("event_type", params.eventType);
  }

  if (params.resourceType) {
    query = query.eq("resource_type", params.resourceType);
  }

  query = query.range(
    params.offset ?? 0,
    (params.offset ?? 0) + (params.limit ?? 50) - 1
  );

  const { data, error } = await query;

  if (error) {
    console.error("[Events] Error fetching events:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Get events for a specific resource.
 */
export async function getEventsByResource(
  schoolId: string,
  resourceType: string,
  resourceId: string
): Promise<
  Array<{
    id: string;
    event_type: string;
    created_at: string;
    payload: Record<string, unknown>;
  }>
> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("domain_events")
    .select("id, event_type, created_at, payload")
    .eq("school_id", schoolId)
    .eq("resource_type", resourceType)
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Events] Error fetching resource events:", error);
    return [];
  }

  return data ?? [];
}
