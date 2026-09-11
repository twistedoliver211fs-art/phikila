import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getPlatformStats, getSystemSettings, updateSystemSetting } from "@/lib/services/platform";
import { ForbiddenError } from "@/lib/errors";

const PAGE_SIZE = 50;

async function requireSuperAdmin(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>) {
  const { data } = await supabase.rpc("is_super_admin");
  if (!data) throw new ForbiddenError("Super admin access required");
}

export const GET = createRoute(
  async ({ searchParams, supabase }) => {
  await requireSuperAdmin(supabase);
  const view = searchParams.get("view") ?? "stats";

  switch (view) {
    case "schools": {
      const admin = createAdminClient();
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
      const limit = PAGE_SIZE;
      const offset = (page - 1) * limit;
      const search = searchParams.get("search") ?? "";
      const status = searchParams.get("status") ?? "";

      let query = admin
        .from("schools")
        .select("id, name, slug, status, subscription_status, school_type, education_level, created_at, principal_email", { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        const pattern = `%${search}%`;
        query = query.or(`name.ilike.${pattern},slug.ilike.${pattern},principal_email.ilike.${pattern}`);
      }

      if (status) {
        query = query.eq("status", status);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: schools, error, count } = await query;
      if (error) throw error;

      const schoolIds = (schools ?? []).map((s) => s.id);
      const { data: memberCounts } = await admin
        .from("school_members")
        .select("school_id")
        .in("school_id", schoolIds)
        .eq("is_active", true);

      const counts: Record<string, number> = {};
      (memberCounts ?? []).forEach((m) => {
        counts[m.school_id] = (counts[m.school_id] || 0) + 1;
      });

      const total = count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        schools: (schools ?? []).map((s) => ({
          ...s,
          member_count: counts[s.id] || 0,
        })),
        total,
        page,
        limit,
        totalPages,
      });
    }

    case "schools-list": {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("schools")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return NextResponse.json({ schools: data ?? [] });
    }

    case "users": {
      const admin = createAdminClient();
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
      const limit = PAGE_SIZE;
      const offset = (page - 1) * limit;
      const search = searchParams.get("search") ?? "";
      const role = searchParams.get("role") ?? "";
      const schoolId = searchParams.get("school_id") ?? "";
      const status = searchParams.get("status") ?? "";

      let query = admin
        .from("school_members")
        .select("id, role, is_active, joined_at, user_id, school_id, schools(name)", { count: "exact" })
        .order("joined_at", { ascending: false });

      if (role) {
        query = query.eq("role", role);
      }

      if (schoolId) {
        query = query.eq("school_id", schoolId);
      }

      if (status === "active") {
        query = query.eq("is_active", true);
      } else if (status === "inactive") {
        query = query.eq("is_active", false);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: members, error, count } = await query;
      if (error) throw error;

      let filteredMembers = members ?? [];

      if (search) {
        const q = search.toLowerCase();
        filteredMembers = filteredMembers.filter(
          (m) =>
            m.user_id.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            m.schools?.[0]?.name?.toLowerCase().includes(q)
        );
      }

      const total = count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        members: filteredMembers,
        total,
        page,
        limit,
        totalPages,
      });
    }

    case "settings": {
      const category = searchParams.get("category") ?? undefined;
      const settings = await getSystemSettings(category);
      return NextResponse.json({ settings });
    }

    default: {
      const stats = await getPlatformStats();
      return NextResponse.json({ stats });
    }
  }
},
  { rateLimit: { maxRequests: 30, windowMs: 60_000, prefix: "platform:GET" } }
);

export const POST = createRoute(
  async ({ request, user, supabase }) => {
  await requireSuperAdmin(supabase);
  const body = await request.json();

  if (body.action && body.ids) {
    const { action, ids } = body;
    const admin = createAdminClient();

    switch (action) {
      case "bulk_approve": {
        const { error } = await admin
          .from("schools")
          .update({ status: "active" })
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      case "bulk_suspend": {
        const { error } = await admin
          .from("schools")
          .update({ status: "suspended" })
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      case "bulk_reject": {
        const { error } = await admin
          .from("schools")
          .update({ status: "rejected" })
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      case "bulk_delete": {
        const { error } = await admin
          .from("schools")
          .delete()
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      case "bulk_change_role": {
        const { role } = body.params ?? {};
        if (!role) {
          return NextResponse.json({ error: "role is required" }, { status: 400 });
        }
        const { error } = await admin
          .from("school_members")
          .update({ role })
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      case "bulk_deactivate": {
        const { error } = await admin
          .from("school_members")
          .update({ is_active: false })
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      case "bulk_activate": {
        const { error } = await admin
          .from("school_members")
          .update({ is_active: true })
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      case "bulk_remove": {
        const { error } = await admin
          .from("school_members")
          .delete()
          .in("id", ids);
        if (error) throw error;
        return NextResponse.json({ ok: true, affected: ids.length });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  }

  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  const setting = await updateSystemSetting(key, value, user.id);
  return NextResponse.json({ setting });
},
  { rateLimit: { maxRequests: 20, windowMs: 60_000, prefix: "platform:POST" } }
);
