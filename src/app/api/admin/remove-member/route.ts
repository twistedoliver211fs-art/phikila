import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export async function DELETE(request: Request) {
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

  // Check if user is super_admin
  const { data: isAdmin } = await supabase.rpc("is_super_admin");

  if (!isAdmin) {
    // Check if user is a principal of the member's school
    const { data: member } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("id", memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const { data: isPrincipal } = await supabase
      .from("school_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("school_id", member.school_id)
      .eq("role", "principal")
      .eq("is_active", true)
      .limit(1);

    if (!isPrincipal || isPrincipal.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("school_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    console.error("[remove-member] Failed:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
