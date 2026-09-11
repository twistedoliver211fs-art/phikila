import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { getDocuments, createDocument, getCategories } from "@/lib/services/document";

export const GET = createRoute(async ({ searchParams }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const type = searchParams.get("type");
  if (type === "categories") {
    const categories = await getCategories(schoolId);
    return NextResponse.json({ categories });
  }

  const documents = await getDocuments(schoolId);
  return NextResponse.json({ documents });
});

export const POST = createRoute(async ({ request }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const body = await request.json();
  const { title, description, fileName, filePath, fileSize, mimeType, categoryId, isPublic } = body;

  const document = await createDocument({
    schoolId,
    title,
    description,
    fileName,
    filePath,
    fileSize,
    mimeType,
    categoryId,
    isPublic,
  });

  return NextResponse.json({ document }, { status: 201 });
});
