import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { ASSIGNABLE_ROLES, isMemberRole } from "@/lib/membership";

const SCHOOL_STATUSES = new Set(["pending", "approved", "active", "suspended", "archived"]);
const SUBSCRIPTION_STATUSES = new Set(["trial", "active", "past_due", "cancelled"]);

export async function handleRemoveMember(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const { data: target } = await supabase
    .from("school_members")
    .select("id, user_id, school_id, role")
    .eq("id", memberId)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (target.user_id === user.id) {
    return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
  }

  const { data: isAdmin } = await supabase.rpc("is_super_admin");

  if (!isAdmin) {
    if (target.role === "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: isPrincipal } = await supabase
      .from("school_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("school_id", target.school_id)
      .eq("role", "principal")
      .eq("is_active", true)
      .limit(1);

    if (!isPrincipal || isPrincipal.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.from("school_members").delete().eq("id", memberId);

  if (error) {
    console.error("[remove-member] Failed:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function handleUpdateMember(request: Request) {
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

  let body: { memberId?: unknown; role?: unknown; isActive?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const memberId = body.memberId;
  if (typeof memberId !== "string" || !memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.role !== undefined) {
    if (!isMemberRole(body.role) || !(ASSIGNABLE_ROLES as string[]).includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = body.role;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }
    updates.is_active = body.isActive;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("school_members").update(updates).eq("id", memberId);

  if (error) {
    console.error("[update-member] Failed:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function handleUpdateSchool(request: Request) {
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

  let body: { schoolId?: unknown; status?: unknown; subscriptionStatus?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const schoolId = body.schoolId;
  if (typeof schoolId !== "string" || !schoolId) {
    return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !SCHOOL_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.subscriptionStatus !== undefined) {
    if (
      typeof body.subscriptionStatus !== "string" ||
      !SUBSCRIPTION_STATUSES.has(body.subscriptionStatus)
    ) {
      return NextResponse.json({ error: "Invalid subscription status" }, { status: 400 });
    }
    updates.subscription_status = body.subscriptionStatus;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("schools").update(updates).eq("id", schoolId);

  if (error) {
    console.error("[update-school] Failed:", error);
    return NextResponse.json({ error: "Failed to update school" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
