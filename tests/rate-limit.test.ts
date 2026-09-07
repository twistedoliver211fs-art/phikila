import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Clear the store by running through all possible keys
    // The rate limiter uses a module-level Map, so we test with unique keys
  });

  it("allows requests under the limit", () => {
    const key = `test-allow-${Date.now()}`;
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("tracks remaining count correctly", () => {
    const key = `test-remaining-${Date.now()}`;
    checkRateLimit(key, 3, 60_000);
    const second = checkRateLimit(key, 3, 60_000);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests over the limit", () => {
    const key = `test-block-${Date.now()}`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const third = checkRateLimit(key, 2, 60_000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const key = `test-reset-${Date.now()}`;
    checkRateLimit(key, 1, 1); // 1ms window
    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 5));
    const after = checkRateLimit(key, 1, 60_000);
    expect(after.allowed).toBe(true);
  });

  it("returns correct resetAt timestamp", () => {
    const key = `test-resetAt-${Date.now()}`;
    const before = Date.now();
    const result = checkRateLimit(key, 5, 10_000);
    expect(result.resetAt).toBeGreaterThanOrEqual(before + 10_000);
  });

  it("different keys are independent", () => {
    const base = `test-independent-${Date.now()}`;
    checkRateLimit(`${base}-a`, 1, 60_000);
    const b = checkRateLimit(`${base}-b`, 1, 60_000);
    expect(b.allowed).toBe(true);
  });
});
