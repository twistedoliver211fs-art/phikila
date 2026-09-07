import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { rateLimit } from "@/lib/rate-limit";

const SCHOOL_TYPES = new Set(["public", "private", "international", "other"]);
const EDUCATION_LEVELS = new Set(["junior", "senior", "junior_senior"]);

export async function handleRegisterSchool(request: Request) {
  const rl = rateLimit(request, { maxRequests: 5, windowMs: 60_000, prefix: "register-school" });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "School name is required" }, { status: 400 });
  }

  const schoolType =
    typeof body.schoolType === "string" && SCHOOL_TYPES.has(body.schoolType)
      ? body.schoolType
      : "private";
  const educationLevel =
    typeof body.educationLevel === "string" && EDUCATION_LEVELS.has(body.educationLevel)
      ? body.educationLevel
      : "junior_senior";

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  const admin = createAdminClient();

  const { data: existing } = await admin.from("schools").select("id").eq("slug", slug).limit(1);

  let finalSlug = slug || `school-${Date.now().toString(36)}`;
  if (existing && existing.length > 0) {
    finalSlug = `${slug}-${Date.now().toString(36)}`;
  }

  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({
      name,
      slug: finalSlug,
      school_type: schoolType,
      education_level: educationLevel,
      phone: typeof body.phone === "string" ? body.phone.slice(0, 40) : null,
      email: typeof body.email === "string" ? body.email.slice(0, 120) : user.email || null,
      address: typeof body.address === "string" ? body.address.slice(0, 240) : null,
      status: "pending",
      subscription_status: "trial",
    })
    .select("id")
    .single();

  if (schoolError || !school) {
    console.error("[register-school] School creation failed:", schoolError);
    return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
  }

  const { error: memberError } = await admin.from("school_members").insert({
    user_id: user.id,
    school_id: school.id,
    role: "principal",
    is_active: true,
  });

  if (memberError) {
    console.error("[register-school] Member creation failed:", memberError);
    await admin.from("schools").delete().eq("id", school.id);
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    schoolId: school.id,
    slug: finalSlug,
  });
}
