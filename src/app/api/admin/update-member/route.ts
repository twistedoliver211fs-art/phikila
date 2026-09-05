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
