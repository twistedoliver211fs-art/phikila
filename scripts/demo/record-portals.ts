/**
 * Playwright Multi-Portal Demo Recording
 * Logs in via UI with each demo credential and records the portal experience.
 * Usage: npx tsx scripts/demo/record-portals.ts
 */

import { chromium } from "playwright-core";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const OUTPUT_DIR = path.join(__dirname, "output");
const WIDTH = 1920;
const HEIGHT = 1080;

// All demo portals — excludes super admin
const DEMO_PORTALS = [
  {
    id: "principal",
    email: "principal@decimal.app",
    password: "Demo1234!",
    label: "Principal Portal",
    portal: "/principal",
    scenes: [
      { url: "/principal", wait: "Dashboard", duration: 3000 },
      { url: "/principal/students", wait: "Students", duration: 2500 },
      { url: "/principal/fees", wait: "Fees", duration: 2500 },
      { url: "/principal/attendance", wait: "Attendance", duration: 2500 },
      { url: "/principal/exams", wait: "Exams", duration: 2500 },
    ],
  },
  {
    id: "teacher",
    email: "teacher@decimal.app",
    password: "Demo1234!",
    label: "Teacher Portal",
    portal: "/teacher",
    scenes: [
      { url: "/teacher", wait: "Dashboard", duration: 3000 },
      { url: "/teacher/attendance", wait: "Attendance", duration: 2500 },
      { url: "/teacher/students", wait: "Students", duration: 2500 },
      { url: "/teacher/exams", wait: "Exams", duration: 2500 },
    ],
  },
  {
    id: "parent",
    email: "parent@decimal.app",
    password: "Demo1234!",
    label: "Parent Portal",
    portal: "/parent",
    scenes: [
      { url: "/parent", wait: "Dashboard", duration: 3000 },
      { url: "/parent/attendance", wait: "Attendance", duration: 2500 },
      { url: "/parent/fees", wait: "Fees", duration: 2500 },
      { url: "/parent/messages", wait: "Messages", duration: 2500 },
    ],
  },
  {
    id: "finance",
    email: "finance@decimal.app",
    password: "Demo1234!",
    label: "Finance Portal",
    portal: "/finance",
    scenes: [
      { url: "/finance", wait: "Dashboard", duration: 3000 },
      { url: "/finance/payments", wait: "Payments", duration: 2500 },
      { url: "/finance/fee-structures", wait: "Fee Structures", duration: 2500 },
    ],
  },
  {
    id: "secretary",
    email: "secretary@decimal.app",
    password: "Demo1234!",
    label: "Secretary Portal",
    portal: "/secretary",
    scenes: [
      { url: "/secretary", wait: "Dashboard", duration: 3000 },
      { url: "/secretary/announcements", wait: "Announcements", duration: 2500 },
    ],
  },
  {
    id: "admissions",
    email: "admissions@decimal.app",
    password: "Demo1234!",
    label: "Admissions Portal",
    portal: "/admissions-officer",
    scenes: [
      { url: "/admissions-officer", wait: "Dashboard", duration: 3000 },
      { url: "/admissions-officer/students", wait: "Students", duration: 2500 },
    ],
  },
];

async function createDemoUsersViaAPI() {
  console.log("👤 Ensuring all demo users exist via Supabase Admin API...");
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  for (const portal of DEMO_PORTALS) {
    // Check if user exists
    const { data: existing } = await supabase.auth.admin.listUsers();
    const user = existing?.users?.find((u: any) => u.email === portal.email);

    if (user) {
      console.log(`   ✅ ${portal.email} already exists`);
      continue;
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email: portal.email,
      password: portal.password,
      email_confirm: true,
    });

    if (error) {
      console.error(`   ❌ Failed to create ${portal.email}: ${error.message}`);
    } else {
      console.log(`   ✅ Created ${portal.email}`);
    }
  }
}

async function loginViaUI(
  page: any,
  email: string,
  password: string
): Promise<boolean> {
  console.log(`   🔐 Logging in as ${email} via UI...`);

  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(1000);

  // Fill email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  await emailInput.first().fill(email);

  // Fill password
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  await passwordInput.first().fill(password);

  // Click submit
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.first().click();

  // Wait for navigation away from login
  try {
    await page.waitForURL((url: string) => !url.includes("/login"), { timeout: 10000 });
    console.log(`   ✅ Login successful — redirected to ${page.url()}`);
    return true;
  } catch {
    console.log(`   ⚠️ Login may have failed — still on ${page.url()}`);
    return false;
  }
}

async function recordPortal(
  browser: any,
  portal: (typeof DEMO_PORTALS)[0]
) {
  console.log(`\n🎬 Recording: ${portal.label}`);

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: path.join(OUTPUT_DIR, portal.id),
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  const page = await context.newPage();

  // Login via UI
  const loggedIn = await loginViaUI(page, portal.email, portal.password);
  if (!loggedIn) {
    console.log(`   ❌ Skipping ${portal.label} — login failed`);
    await context.close();
    return;
  }

  // Wait for school picker if present
  try {
    const schoolPicker = page.locator('text=Decimal Demo Academy, text=Select School, button:has-text("Select")');
    if (await schoolPicker.isVisible({ timeout: 3000 })) {
      console.log("   🏫 School picker detected — selecting Decimal Demo Academy");
      await schoolPicker.first().click();
      await page.waitForTimeout(2000);
    }
  } catch {
    // No school picker, continue
  }

  // Record each scene
  for (const scene of portal.scenes) {
    console.log(`   📸 Scene: ${scene.url}`);

    const fullUrl = `${BASE_URL}${scene.url}`;
    await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 15000 });

    // Wait for content to load
    try {
      await page.waitForSelector(`text=${scene.wait}`, { timeout: 8000 });
    } catch {
      console.log(`      ⚠️ Selector "${scene.wait}" not found, continuing...`);
    }

    // Wait for scene duration
    await page.waitForTimeout(scene.duration);
    console.log(`      ✅ Captured`);
  }

  await context.close();
  console.log(`   ✅ ${portal.label} recording complete`);
}

async function run() {
  console.log("🚀 Decimal Multi-Portal Demo Recording");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Resolution: ${WIDTH}x${HEIGHT}`);
  console.log(`   Portals: ${DEMO_PORTALS.length}`);

  // Create output directories
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const portal of DEMO_PORTALS) {
    fs.mkdirSync(path.join(OUTPUT_DIR, portal.id), { recursive: true });
  }

  // Ensure demo users exist
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await createDemoUsersViaAPI();
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  // Record each portal
  for (const portal of DEMO_PORTALS) {
    await recordPortal(browser, portal);
  }

  await browser.close();

  // Generate summary
  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    resolution: `${WIDTH}x${HEIGHT}`,
    portals: DEMO_PORTALS.map((p) => ({
      id: p.id,
      email: p.email,
      label: p.label,
      portal: p.portal,
      scenes: p.scenes.length,
      outputDir: path.join(OUTPUT_DIR, p.id),
    })),
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "portals-summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\n✅ All recordings complete!`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📊 Summary: ${path.join(OUTPUT_DIR, "portals-summary.json")}`);
}

run().catch((err) => {
  console.error("❌ Recording failed:", err);
  process.exit(1);
});
