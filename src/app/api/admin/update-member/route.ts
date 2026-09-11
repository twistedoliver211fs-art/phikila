import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { rateLimit } from "@/lib/rate-limit";

export async function PATCH(request: Request) {
  const rl = await rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: "admin:update-member" });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("is_super_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { memberId, role, isActive } = body;

  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.is_active = isActive;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("school_members")
    .update(updates)
    .eq("id", memberId);

  if (error) {
    console.error("[update-member] Failed:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
