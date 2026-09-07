/**
 * Playwright Demo Recording Script
 * Records the Phikila app for demo video generation.
 *
 * Usage: npx tsx scripts/demo/record.ts
 * Requires: PLAYWRIGHT_BASE_URL env var (default: http://localhost:3000)
 */

import { chromium } from "playwright-core";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const OUTPUT_DIR = path.join(__dirname, "output");
const FRAMES_DIR = path.join(OUTPUT_DIR, "frames");
const NARRATION_FILE = path.join(__dirname, "narration.json");
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

interface Step {
  type: "wait" | "fill" | "click" | "screenshot";
  ms?: number;
  selector?: string;
  value?: string;
}

interface Scene {
  id: string;
  duration: number;
  narration: string;
  action: string;
  url?: string;
  steps?: Step[];
  caption: string;
}

interface NarrationData {
  scenes: Scene[];
}

async function run() {
  console.log("🎬 Starting Phikila demo recording...");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Resolution: ${WIDTH}x${HEIGHT}`);
  console.log(`   FPS: ${FPS}`);

  // Create output directories
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  // Load narration script
  const narration: NarrationData = JSON.parse(
    fs.readFileSync(NARRATION_FILE, "utf-8")
  );

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

  // Process each scene
  let globalFrame = 0;

  for (const scene of narration.scenes) {
    console.log(`\n📸 Scene: ${scene.id} (${scene.duration}s)`);

    // Navigate if needed
    if (scene.url) {
      const fullUrl = `${BASE_URL}${scene.url}`;
      console.log(`   Navigating to: ${fullUrl}`);
      await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 30000 });
    }

    // Execute steps
    if (scene.steps) {
      for (const step of scene.steps) {
        switch (step.type) {
          case "wait":
            console.log(`   Waiting ${step.ms}ms`);
            await page.waitForTimeout(step.ms || 1000);
            break;
          case "fill":
            console.log(`   Filling: ${step.selector}`);
            try {
              await page.fill(step.selector!, step.value || "", {
                timeout: 5000,
              });
            } catch {
              console.log(`   ⚠️  Selector not found: ${step.selector}`);
            }
            break;
          case "click":
            console.log(`   Clicking: ${step.selector}`);
            try {
              await page.click(step.selector!, { timeout: 5000 });
            } catch {
              console.log(`   ⚠️  Selector not found: ${step.selector}`);
            }
            break;
        }
      }
    }

    // Record frames for this scene
    const totalFrames = scene.duration * FPS;
    const frameInterval = 1000 / FPS;

    for (let i = 0; i < totalFrames; i++) {
      const framePath = path.join(
        FRAMES_DIR,
        `frame_${String(globalFrame).padStart(6, "0")}.png`
      );
      await page.screenshot({ path: framePath, type: "png" });
      globalFrame++;
      await page.waitForTimeout(frameInterval);
    }

    console.log(`   ✅ Captured ${totalFrames} frames`);
  }

  console.log(`\n🎬 Recording complete! Total frames: ${globalFrame}`);

  // Close browser (video is saved automatically)
  await context.close();
  await browser.close();

  // Save metadata
  const metadata = {
    totalFrames: globalFrame,
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

  console.log(`\n📁 Output saved to: ${OUTPUT_DIR}`);
}

run().catch((err) => {
  console.error("❌ Recording failed:", err);
  process.exit(1);
});
