import { createAdminClient } from "@/lib/supabase/server-admin";
import { createHash, randomBytes } from "crypto";

export interface ApiKey {
  id: string;
  schoolId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  schoolId: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  failureCount: number;
  createdBy: string | null;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: string;
  status: string;
  responseStatus: number | null;
  responseBody: string | null;
  attempts: number;
  deliveredAt: string | null;
  createdAt: string;
}

function mapApiKey(row: Record<string, unknown>): ApiKey {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    name: row.name as string,
    keyPrefix: row.key_prefix as string,
    scopes: row.scopes as string[],
    rateLimit: Number(row.rate_limit),
    isActive: row.is_active as boolean,
    lastUsedAt: row.last_used_at as string | null,
    expiresAt: row.expires_at as string | null,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
  };
}

function mapWebhook(row: Record<string, unknown>): WebhookEndpoint {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    url: row.url as string,
    events: row.events as string[],
    isActive: row.is_active as boolean,
    lastTriggeredAt: row.last_triggered_at as string | null,
    failureCount: Number(row.failure_count),
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
  };
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function generateKey(): string {
  const bytes = randomBytes(32);
  return `pk_live_${bytes.toString("hex")}`;
}

export async function getApiKeys(schoolId: string): Promise<ApiKey[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("api_keys")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapApiKey);
}

export async function createApiKey(params: {
  schoolId: string;
  name: string;
  scopes?: string[];
  rateLimit?: number;
  expiresAt?: string;
  createdBy?: string;
}): Promise<{ apiKey: ApiKey; plainKey: string }> {
  const admin = createAdminClient();
  const plainKey = generateKey();
  const keyHash = hashKey(plainKey);
  const keyPrefix = plainKey.slice(0, 12);

  const { data, error } = await admin
    .from("api_keys")
    .insert({
      school_id: params.schoolId,
      name: params.name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      scopes: params.scopes ?? [],
      rate_limit: params.rateLimit ?? 1000,
      expires_at: params.expiresAt ?? null,
      created_by: params.createdBy ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return { apiKey: mapApiKey(data), plainKey };
}

export async function revokeApiKey(apiKeyId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", apiKeyId);

  if (error) throw error;
}

export async function validateApiKey(keyHash: string): Promise<ApiKey | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return mapApiKey(data);
}

export async function getWebhookEndpoints(schoolId: string): Promise<WebhookEndpoint[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhook_endpoints")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapWebhook);
}

export async function createWebhookEndpoint(params: {
  schoolId: string;
  url: string;
  events?: string[];
  createdBy?: string;
}): Promise<WebhookEndpoint> {
  const admin = createAdminClient();
  const secret = `whsec_${randomBytes(32).toString("hex")}`;

  const { data, error } = await admin
    .from("webhook_endpoints")
    .insert({
      school_id: params.schoolId,
      url: params.url,
      secret,
      events: params.events ?? [],
      created_by: params.createdBy ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapWebhook(data);
}

export async function deleteWebhookEndpoint(endpointId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_endpoints")
    .delete()
    .eq("id", endpointId);

  if (error) throw error;
}

export async function getWebhookDeliveries(
  endpointId: string,
  limit?: number
): Promise<WebhookDelivery[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhook_deliveries")
    .select("*")
    .eq("endpoint_id", endpointId)
    .order("created_at", { ascending: false })
    .limit(limit ?? 50);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    endpointId: row.endpoint_id as string,
    eventType: row.event_type as string,
    status: row.status as string,
    responseStatus: row.response_status as number | null,
    responseBody: row.response_body as string | null,
    attempts: Number(row.attempts),
    deliveredAt: row.delivered_at as string | null,
    createdAt: row.created_at as string,
  }));
}
