import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getWebhookEndpoints, createWebhookEndpoint, deleteWebhookEndpoint, getWebhookDeliveries } from "@/lib/services/apikey";
import { ForbiddenError } from "@/lib/errors";

export const GET = createRoute(async ({ searchParams }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const endpointId = searchParams.get("endpointId");
  if (endpointId) {
    const admin = createAdminClient();
    const { data: endpoint } = await admin
      .from("webhook_endpoints")
      .select("school_id")
      .eq("id", endpointId)
      .single();

    if (!endpoint || endpoint.school_id !== schoolId) {
      throw new ForbiddenError("Webhook endpoint not found in your school");
    }

    const deliveries = await getWebhookDeliveries(endpointId);
    return NextResponse.json({ deliveries });
  }

  const endpoints = await getWebhookEndpoints(schoolId);
  return NextResponse.json({ endpoints });
});

export const POST = createRoute(async ({ request, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { url, events } = body;

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const endpoint = await createWebhookEndpoint({
    schoolId,
    url,
    events,
    createdBy: user.id,
  });

  return NextResponse.json({ endpoint }, { status: 201 });
});

export const DELETE = createRoute(async ({ request }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { endpointId } = body;

  if (!endpointId) {
    return NextResponse.json({ error: "endpointId is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: endpoint } = await admin
    .from("webhook_endpoints")
    .select("school_id")
    .eq("id", endpointId)
    .single();

  if (!endpoint || endpoint.school_id !== schoolId) {
    throw new ForbiddenError("Webhook endpoint not found in your school");
  }

  await deleteWebhookEndpoint(endpointId);
  return NextResponse.json({ ok: true });
});
