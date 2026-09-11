/**
 * School data export — operational safety net.
 *
 * Exports every school-scoped table for one school (or all schools) as
 * timestamped JSON files under ./exports/<school-slug or ALL>/<table>.json.
 *
 * Usage:
 *   npx tsx scripts/export-school-data.ts                # all schools
 *   npx tsx scripts/export-school-data.ts <school_id>    # one school
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
 * (service role bypasses RLS — this is a server-side maintenance tool only).
 */

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const schoolId = process.argv[2];
const supabase = createClient(url, key, { auth: { persistSession: false } });

// Every table with a school_id column, in dependency-safe order.
const TABLES = [
  "schools",
  "school_members",
  "academic_years",
  "terms",
  "grades",
  "classes",
  "subjects",
  "periods",
  "rooms",
  "fee_structures",
  "students",
  "staff",
  "admissions",
  "admission_checks",
  "attendance_records",
  "timetable_slots",
  "exams",
  "exam_results",
  "invoices",
  "invoice_items",
  "payments",
  "student_accounts",
  "announcements",
  "messages",
  "notifications",
  "documents",
] as const;

async function fetchAll(table: string, schoolColumn: string | null, school: string | null) {
  let query = supabase.from(table).select("*");
  if (schoolColumn && school) query = query.eq(schoolColumn, school);
  // Page through to avoid hard row limits.
  const PAGE = 1000;
  let from = 0;
  const rows: Record<string, unknown>[] = [];
  for (;;) {
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function main() {
  // Determine target schools.
  let query = supabase.from("schools").select("id, name, slug");
  if (schoolId) query = query.eq("id", schoolId);
  const { data: schools, error } = await query;
  if (error) {
    console.error(`Failed to list schools: ${error.message}`);
    process.exit(1);
  }
  const targets = schools ?? [];
  if (targets.length === 0) {
    console.error(schoolId ? `School ${schoolId} not found.` : "No schools found.");
    process.exit(1);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  for (const school of targets) {
    const dir = join("exports", school.slug || school.id, stamp);
    await mkdir(dir, { recursive: true });
    console.log(`\nExporting ${school.name} (${school.id}) → ${dir}`);

    // Pre-resolve ids needed for child tables that key through parents.
    const yearIds = new Map<string, string>();
    const { data: years } = await supabase
      .from("academic_years")
      .select("id")
      .eq("school_id", school.id);
    for (const y of years ?? []) yearIds.set(y.id, y.id);

    for (const table of TABLES) {
      try {
        let rows: Record<string, unknown>[];
        if (table === "terms") {
          // terms key through academic_year_id, not school_id.
          rows = [];
          for (const yearId of yearIds.keys()) {
            rows.push(...(await fetchAll("terms", "academic_year_id", yearId)));
          }
        } else if (table === "schools") {
          rows = [school];
        } else {
          rows = await fetchAll(table, "school_id", school.id);
        }
        await writeFile(join(dir, `${table}.json`), JSON.stringify(rows, null, 2));
        console.log(`  ${table}: ${rows.length} rows`);
      } catch (e) {
        // Table may not exist in older deployments — note and continue.
        console.warn(`  ${table}: skipped (${e instanceof Error ? e.message : e})`);
      }
    }

    // Manifest for restore tooling and auditability.
    await writeFile(
      join(dir, "_manifest.json"),
      JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          school: { id: school.id, name: school.name, slug: school.slug },
          tables: TABLES,
          format: "json-rows",
          note: "Self-describing row dump. Restore by inserting rows in dependency order.",
        },
        null,
        2
      )
    );
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
