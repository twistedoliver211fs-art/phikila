import { createAdminClient } from "@/lib/supabase/server-admin";
import { ValidationError } from "@/lib/errors";

export type ImportType = "students" | "staff" | "fees";

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface ImportPreview {
  headers: string[];
  rows: string[][];
  rowCount: number;
}

export function parseCSV(text: string): ImportPreview {
  const lines = text.trim().split("\n");
  if (lines.length < 2) {
    throw new ValidationError("CSV must have a header row and at least one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });

  return { headers, rows, rowCount: rows.length };
}

export async function importStudents(
  schoolId: string,
  preview: ImportPreview,
  classId?: string
): Promise<ImportResult> {
  const admin = createAdminClient();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  const nameIdx = preview.headers.findIndex((h) => h === "name" || h === "first_name");
  const admissionIdx = preview.headers.findIndex((h) => h === "admission_number" || h === "admission");
  const genderIdx = preview.headers.findIndex((h) => h === "gender");
  const dobIdx = preview.headers.findIndex((h) => h === "date_of_birth" || h === "dob");

  if (nameIdx === -1) {
    throw new ValidationError("CSV must have a 'name' or 'first_name' column");
  }

  for (let i = 0; i < preview.rows.length; i++) {
    const row = preview.rows[i];
    try {
      const fullName = row[nameIdx] ?? "";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") || " ";

      if (!firstName) {
        skipped++;
        continue;
      }

      const admissionNumber = row[admissionIdx] ?? `IMP-${schoolId.slice(0, 4)}-${Date.now()}-${i}`;

      const existing = await admin
        .from("students")
        .select("id")
        .eq("school_id", schoolId)
        .eq("admission_number", admissionNumber)
        .single();

      if (existing.data) {
        skipped++;
        continue;
      }

      const insertData: Record<string, unknown> = {
        school_id: schoolId,
        class_id: classId ?? "00000000-0000-0000-0000-000000000000",
        first_name: firstName,
        last_name: lastName,
        admission_number: admissionNumber,
      };

      if (genderIdx !== -1 && row[genderIdx]) {
        insertData.gender = row[genderIdx].toLowerCase();
      }
      if (dobIdx !== -1 && row[dobIdx]) {
        insertData.date_of_birth = row[dobIdx];
      }

      const { error } = await admin.from("students").insert(insertData);
      if (error) throw error;
      imported++;
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { success: errors.length === 0, imported, skipped, errors };
}

export async function importStaff(
  schoolId: string,
  preview: ImportPreview
): Promise<ImportResult> {
  const admin = createAdminClient();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  const nameIdx = preview.headers.findIndex((h) => h === "name" || h === "first_name");

  if (nameIdx === -1) {
    throw new ValidationError("CSV must have a 'name' or 'first_name' column");
  }

  for (let i = 0; i < preview.rows.length; i++) {
    const row = preview.rows[i];
    try {
      const fullName = row[nameIdx] ?? "";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") || " ";

      if (!firstName) {
        skipped++;
        continue;
      }

      const { error } = await admin.from("staff").insert({
        school_id: schoolId,
        first_name: firstName,
        last_name: lastName,
      });

      if (error) throw error;
      imported++;
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { success: errors.length === 0, imported, skipped, errors };
}

export async function importFees(
  schoolId: string,
  preview: ImportPreview,
  termId: string
): Promise<ImportResult> {
  const admin = createAdminClient();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  const nameIdx = preview.headers.findIndex((h) => h === "name" || h === "fee_name");
  const amountIdx = preview.headers.findIndex((h) => h === "amount");

  if (nameIdx === -1 || amountIdx === -1) {
    throw new ValidationError("CSV must have 'name' and 'amount' columns");
  }

  for (let i = 0; i < preview.rows.length; i++) {
    const row = preview.rows[i];
    try {
      const name = row[nameIdx] ?? "";
      const amount = parseFloat(row[amountIdx] ?? "0");

      if (!name || isNaN(amount) || amount <= 0) {
        skipped++;
        continue;
      }

      const { error } = await admin.from("fee_structures").insert({
        school_id: schoolId,
        name,
        amount,
        term_id: termId,
      });

      if (error) throw error;
      imported++;
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { success: errors.length === 0, imported, skipped, errors };
}
