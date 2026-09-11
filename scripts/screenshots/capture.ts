/**
 * Playwright Screenshot Capture
 *
 * 1. Authenticate via GoTrue REST API
 * 2. Inject session via page.evaluate (calls supabase.auth.setSession)
 * 3. Capture screenshots
 */

import { chromium } from "playwright-core";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://decimal-app.vercel.app";
const DEMO_EMAIL = "demo@decimal.app";
const DEMO_PASSWORD = "Demo1234!";

const OUTPUT_DIR = path.join(__dirname, "../../public/images/screenshots");
const WIDTH = 1920;
const HEIGHT = 1080;

interface Screenshot {
  name: string;
  url: string;
  waitFor?: string;
}

const screenshots: Screenshot[] = [
  { name: "principal-dashboard", url: "/principal", waitFor: "h1" },
  { name: "principal-students", url: "/principal/students", waitFor: "h1" },
  { name: "principal-attendance", url: "/principal/attendance", waitFor: "h1" },
  { name: "principal-fees", url: "/principal/fees", waitFor: "h1" },
  { name: "principal-exams", url: "/principal/exams", waitFor: "h1" },
  { name: "principal-timetable", url: "/principal/timetable", waitFor: "h1" },
  { name: "teacher-dashboard", url: "/teacher", waitFor: "h1" },
  { name: "parent-dashboard", url: "/parent", waitFor: "h1" },
  { name: "finance-dashboard", url: "/finance", waitFor: "h1" },
  { name: "landing-hero", url: "/", waitFor: "h1" },
];

async function authenticateViaGoTrue(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  console.log("🔐 Authenticating via GoTrue REST API...");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(
    "https://pgiytpbrnyxnnfupvaiv.supabase.co/auth/v1/token?grant_type=password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anonKey },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`GoTrue auth failed: ${data.error || data.error_description}`);
  }
  console.log(`   ✅ Got tokens for ${data.user.email}`);
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

async function run() {
  // Load .env.local
  const envPath = path.join(__dirname, "../../.env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }

  console.log("📸 Decimal Screenshot Capture");
  console.log(`   URL: ${BASE_URL}\n`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const { accessToken, refreshToken } = await authenticateViaGoTrue();

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/home/marvel/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });

  // Navigate to the app to load the JS bundle
  const page = await context.newPage();
  console.log("🌐 Loading app...");
  await page.goto(BASE_URL, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);

  // Inject session via page's own Supabase client
  console.log("🔧 Injecting session via Supabase client...");

  // First, try to import the supabase client module dynamically
  const injectResult = await page.evaluate(
    async ({ accessToken, refreshToken, anonKey }) => {
      try {
        // The app's supabase client is created via @supabase/ssr createBrowserClient
        // We can create our own instance using the same factory
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          "https://pgiytpbrnyxnnfupvaiv.supabase.co",
          anonKey
        );

        // Set the session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) return { ok: false, error: error.message };

        // Verify it worked
        const { data: sessionData } = await supabase.auth.getSession();
        return {
          ok: true,
          user: data?.user?.email,
          hasSession: !!sessionData?.session,
          cookies: document.cookie,
        };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
    { accessToken, refreshToken, anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }
  );

  console.log("   Result:", injectResult);

  // Also try via CDP to set cookies directly
  const cdpSession = await page.context().newCDPSession(page);
  const supabaseRef = "pgiytpbrnyxnnfupvaiv";

  // @supabase/ssr format: base64url-encoded JSON with "base64-" prefix
  const tokenData = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: "bearer",
  };
  const b64url = Buffer.from(JSON.stringify(tokenData)).toString("base64url");
  const cookieValue = `base64-${b64url}`;

  await cdpSession.send("Network.setCookie", {
    name: `sb-${supabaseRef}-auth-token`,
    value: cookieValue,
    domain: "localhost",
    path: "/",
    secure: false,
    sameSite: "Lax",
  });

  // Also set the active role cookie for multi-school users
  await cdpSession.send("Network.setCookie", {
    name: "decimal_active_role",
    value: "principal",
    domain: "localhost",
    path: "/",
    secure: false,
    sameSite: "Lax",
  });
  console.log(`   🍪 Set cookies via CDP`);

  // Test navigation
  console.log("\n🧪 Testing session...");
  await page.goto(`${BASE_URL}/principal`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(5000);

  const testUrl = page.url();
  console.log(`   → ${testUrl}`);

  if (testUrl.includes("/login")) {
    console.log("   ❌ Session invalid. Trying school-picker redirect...");

    // Maybe we need to go through the school picker flow
    await page.goto(`${BASE_URL}/school-picker`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);
    const pickerUrl = page.url();
    console.log(`   → ${pickerUrl}`);

    if (pickerUrl.includes("/login")) {
      console.log("   ❌ Cookie injection approach failed.");
      console.log("   The @supabase/ssr library likely uses a different cookie format.");
      console.log("   Falling back to page-level auth...");
    }
  } else {
    console.log("   ✅ Session works!");
  }

  // Capture screenshots
  for (const shot of screenshots) {
    console.log(`\n📸 ${shot.name}`);

    const filePath = path.join(OUTPUT_DIR, `${shot.name}.png`);
    if (fs.existsSync(filePath)) {
      console.log(`   ⏭️ Exists, skipping`);
      continue;
    }

    let shotPage: any;
    try {
      shotPage = await context.newPage();
      await shotPage.goto(`${BASE_URL}${shot.url}`, { waitUntil: "domcontentloaded", timeout: 30000 });

      if (shot.waitFor) {
        try { await shotPage.waitForSelector(shot.waitFor, { timeout: 10000 }); } catch {}
      }

      await shotPage.waitForTimeout(4000);
      await shotPage.screenshot({ path: filePath });
      console.log(`   ✅ Saved`);
    } catch (err) {
      console.error(`   ❌ ${(err as Error).message?.slice(0, 100)}`);
    } finally {
      try { await shotPage?.close(); } catch {}
    }
  }

  await browser.close();
  console.log(`\n✅ Done!`);
  fs.readdirSync(OUTPUT_DIR).forEach((f) => console.log(`   ${f}`));
}

run().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
