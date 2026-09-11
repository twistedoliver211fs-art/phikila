import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { ForbiddenError } from "@/lib/errors";

async function requireSuperAdmin(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>) {
  const { data } = await supabase.rpc("is_super_admin");
  if (!data) throw new ForbiddenError("Super admin access required");
}

export const GET = createRoute(async ({ user, supabase }) => {
  await requireSuperAdmin(supabase);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feature_flags")
    .select("*")
    .order("key");

  if (error) throw error;
  return NextResponse.json({ flags: data ?? [] });
});

export const POST = createRoute(async ({ request, user, supabase }) => {
  await requireSuperAdmin(supabase);
  const body = await request.json();
  const { flagId, isEnabled } = body;

  if (!flagId || typeof isEnabled !== "boolean") {
    return NextResponse.json({ error: "flagId and isEnabled required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feature_flags")
    .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
    .eq("id", flagId)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ flag: data });
});
