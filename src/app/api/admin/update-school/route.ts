import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Check if user is super_admin
  const { data: isAdmin } = await supabase.rpc("is_super_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { schoolId, status, subscriptionStatus } = body;

  if (!schoolId) {
    return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (subscriptionStatus !== undefined) updates.subscription_status = subscriptionStatus;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("schools")
    .update(updates)
    .eq("id", schoolId);

  if (error) {
    console.error("[update-school] Failed:", error);
    return NextResponse.json({ error: "Failed to update school" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
