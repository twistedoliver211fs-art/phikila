import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { parseCSV, importStudents, importStaff, importFees } from "@/lib/services/import";
import { ValidationError } from "@/lib/errors";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = createRoute(async ({ request }) => {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "No active school" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const importType = formData.get("type") as string;
  const classId = formData.get("classId") as string | null;
  const termId = formData.get("termId") as string | null;

  if (!file) {
    throw new ValidationError("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  if (!file.name.endsWith(".csv")) {
    throw new ValidationError("Only CSV files are supported");
  }

  if (!importType || !["students", "staff", "fees"].includes(importType)) {
    throw new ValidationError("type must be 'students', 'staff', or 'fees'");
  }

  const text = await file.text();
  const preview = parseCSV(text);

  if (preview.rowCount === 0) {
    throw new ValidationError("CSV file is empty or has no data rows");
  }

  if (preview.rowCount > 1000) {
    throw new ValidationError("CSV file exceeds 1000 row limit");
  }

  let result;
  switch (importType) {
    case "students":
      result = await importStudents(schoolId, preview, classId ?? undefined);
      break;
    case "staff":
      result = await importStaff(schoolId, preview);
      break;
    case "fees":
      if (!termId) throw new ValidationError("termId is required for fee imports");
      result = await importFees(schoolId, preview, termId);
      break;
  }

  return NextResponse.json({ result });
});

export const GET = createRoute(async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new ValidationError("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  const text = await file.text();
  const preview = parseCSV(text);

  return NextResponse.json({ preview });
});
