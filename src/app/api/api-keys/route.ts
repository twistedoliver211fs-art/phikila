import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getApiKeys, createApiKey, revokeApiKey } from "@/lib/services/apikey";
import { ForbiddenError } from "@/lib/errors";

export const GET = createRoute(async () => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const apiKeys = await getApiKeys(schoolId);
  return NextResponse.json({ apiKeys });
});

export const POST = createRoute(async ({ request, user }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { name, scopes, rateLimit, expiresAt } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { apiKey, plainKey } = await createApiKey({
    schoolId,
    name,
    scopes,
    rateLimit,
    expiresAt,
    createdBy: user.id,
  });

  return NextResponse.json({ apiKey, plainKey }, { status: 201 });
});

export const DELETE = createRoute(async ({ request }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { apiKeyId } = body;

  if (!apiKeyId) {
    return NextResponse.json({ error: "apiKeyId is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: key } = await admin
    .from("api_keys")
    .select("school_id")
    .eq("id", apiKeyId)
    .single();

  if (!key || key.school_id !== schoolId) {
    throw new ForbiddenError("API key not found in your school");
  }

  await revokeApiKey(apiKeyId);
  return NextResponse.json({ ok: true });
});
