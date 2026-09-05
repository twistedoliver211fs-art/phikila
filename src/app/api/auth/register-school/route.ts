import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { name, schoolType, educationLevel, phone, email, address } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "School name is required" }, { status: 400 });
  }

  // Generate slug from school name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const admin = createAdminClient();

  // Check if slug is unique
  const { data: existing } = await admin
    .from("schools")
    .select("id")
    .eq("slug", slug)
    .limit(1);

  let finalSlug = slug;
  if (existing && existing.length > 0) {
    finalSlug = `${slug}-${Date.now().toString(36)}`;
  }

  // Create the school
  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({
      name: name.trim(),
      slug: finalSlug,
      school_type: schoolType || "private",
      education_level: educationLevel || "junior_senior",
      phone: phone || null,
      email: email || user.email || null,
      address: address || null,
      status: "pending",
      subscription_status: "trial",
    })
    .select("id")
    .single();

  if (schoolError) {
    console.error("[register-school] School creation failed:", schoolError);
    return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
  }

  // Add the user as principal
  const { error: memberError } = await admin
    .from("school_members")
    .insert({
      user_id: user.id,
      school_id: school.id,
      role: "principal",
      is_active: true,
    });

  if (memberError) {
    console.error("[register-school] Member creation failed:", memberError);
    // Rollback: delete the school
    await admin.from("schools").delete().eq("id", school.id);
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    schoolId: school.id,
    slug: finalSlug,
  });
}
