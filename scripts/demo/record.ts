/**
 * Playwright Demo Recording Script
 * Records the Phikila app for demo video generation.
 *
 * Authenticates via Supabase API (not UI) since login is Google OAuth only.
 * Usage: npx tsx scripts/demo/record.ts
 */

import { chromium } from "playwright-core";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DEMO_EMAIL = "demo@phikila.app";
const DEMO_PASSWORD = "Demo1234!";

const OUTPUT_DIR = path.join(__dirname, "output");
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

interface Scene {
  id: string;
  duration: number;
  narration: string;
  caption: string;
  url?: string;
  waitFor?: string;
  scroll?: "down" | "up";
  scrollPx?: number;
}

interface NarrationData {
  scenes: Scene[];
}

async function authenticateSupabase(): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  console.log("🔐 Authenticating via Supabase API...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    throw new Error(`Supabase auth failed: ${error.message}`);
  }

  console.log(`   ✅ Authenticated as ${DEMO_EMAIL}`);
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}

async function injectSession(
  page: Awaited<ReturnType<typeof chromium["launch"]>>["contexts"] extends () => Promise<(infer T)[]> ? T : never,
  tokens: { access_token: string; refresh_token: string }
) {
  console.log("🍪 Injecting session into browser...");

  // Supabase SSR stores session in cookies via sb-<project-ref>-auth-token
  // We need to set the cookies that @supabase/ssr expects
  const supabaseProjectRef = "pgiytpbrnyxnnfupvaiv";
  const cookieName = `sb-${supabaseProjectRef}-auth-token`;

  // The cookie value is a base64-encoded JSON with access_token, refresh_token, etc.
  const cookieValue = Buffer.from(
    JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      token_type: "bearer",
    })
  ).toString("base64");

  await page.context().addCookies([
    {
      name: cookieName,
      value: cookieValue,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  console.log("   ✅ Session cookies injected");
}

async function run() {
  console.log("🎬 Starting Phikila demo recording...");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Resolution: ${WIDTH}x${HEIGHT}`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const narration: NarrationData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "narration.json"), "utf-8")
  );

  // Authenticate first
  const tokens = await authenticateSupabase();

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

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  const page = await context.newPage();

  // Inject auth session
  await injectSession(page, tokens);

  for (const scene of narration.scenes) {
    console.log(`\n📸 Scene: ${scene.id} (${scene.duration}s)`);

    if (scene.url) {
      const fullUrl = `${BASE_URL}${scene.url}`;
      console.log(`   Navigating to: ${fullUrl}`);
      await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 30000 });
    }

    // Wait for a specific element to appear
    if (scene.waitFor) {
      console.log(`   Waiting for selector: ${scene.waitFor}`);
      try {
        await page.waitForSelector(scene.waitFor, { timeout: 10000 });
      } catch {
        console.log(`   ⚠️  Selector not found, continuing: ${scene.waitFor}`);
      }
    }

    // Scroll if needed
    if (scene.scroll) {
      const px = scene.scrollPx || 400;
      const direction = scene.scroll === "down" ? px : -px;
      console.log(`   Scrolling ${scene.scroll} ${px}px`);
      await page.mouse.wheel(0, direction);
    }

    // Wait a moment for rendering
    await page.waitForTimeout(1500);

    // Capture frames for this scene's duration
    const totalFrames = scene.duration * FPS;
    const frameInterval = 1000 / FPS;

    for (let i = 0; i < totalFrames; i++) {
      await page.waitForTimeout(frameInterval);
    }

    console.log(`   ✅ Scene ${scene.id} complete`);
  }

  console.log(`\n🎬 Recording complete!`);

  await context.close();
  await browser.close();

  // Save metadata
  const metadata = {
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    duration: narration.scenes.reduce((sum, s) => sum + s.duration, 0),
    scenes: narration.scenes.map((s) => ({
      id: s.id,
      duration: s.duration,
      narration: s.narration,
      caption: s.caption,
    })),
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  console.log(`📁 Output saved to: ${OUTPUT_DIR}`);
}

run().catch((err) => {
  console.error("❌ Recording failed:", err);
  process.exit(1);
});
