import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockIncr, mockExpire, mockTtl } = vi.hoisted(() => ({
  mockIncr: vi.fn(),
  mockExpire: vi.fn(),
  mockTtl: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  default: {
    incr: mockIncr,
    expire: mockExpire,
    ttl: mockTtl,
  },
}));

import { rateLimit } from "@/lib/rate-limit";

function makeRequest(headers?: Record<string, string>) {
  return new Request("http://localhost/api/test", {
    headers: { ...headers },
  });
}

describe("rateLimit (async Redis-based)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIncr.mockResolvedValue(1);
    mockExpire.mockResolvedValue(true);
    mockTtl.mockResolvedValue(59);
  });

  it("allows requests under the limit", async () => {
    mockIncr.mockResolvedValue(1);

    const result = await rateLimit(makeRequest(), { maxRequests: 3, windowMs: 60_000 });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(mockIncr).toHaveBeenCalled();
    expect(mockExpire).toHaveBeenCalledWith(expect.any(String), 60);
  });

  it("sets expiry on the first request", async () => {
    mockIncr.mockResolvedValue(1);

    await rateLimit(makeRequest(), { maxRequests: 5, windowMs: 30_000 });

    expect(mockExpire).toHaveBeenCalledWith(expect.any(String), 30);
  });

  it("does not reset expiry on subsequent requests", async () => {
    mockIncr.mockResolvedValue(3);

    await rateLimit(makeRequest(), { maxRequests: 5, windowMs: 60_000 });

    expect(mockExpire).not.toHaveBeenCalled();
  });

  it("blocks requests over the limit", async () => {
    mockIncr.mockResolvedValue(4);
    mockTtl.mockResolvedValue(30);

    const result = await rateLimit(makeRequest(), { maxRequests: 3, windowMs: 60_000 });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("returns correct resetAt from TTL", async () => {
    mockIncr.mockResolvedValue(1);
    mockTtl.mockResolvedValue(45);
    const before = Date.now();

    const result = await rateLimit(makeRequest(), { maxRequests: 10, windowMs: 60_000 });

    expect(result.resetAt).toBeGreaterThanOrEqual(before + 45_000);
    expect(result.resetAt).toBeLessThanOrEqual(before + 46_000);
  });

  it("uses prefix in the Redis key", async () => {
    mockIncr.mockResolvedValue(1);

    await rateLimit(makeRequest(), { maxRequests: 10, windowMs: 60_000, prefix: "my-prefix" });

    const key = mockIncr.mock.calls[0][0];
    expect(key).toContain("my-prefix");
  });

  it("defaults prefix to global", async () => {
    mockIncr.mockResolvedValue(1);

    await rateLimit(makeRequest(), { maxRequests: 10, windowMs: 60_000 });

    const key = mockIncr.mock.calls[0][0];
    expect(key).toMatch(/^rl:/);
  });

  it("extracts IP from x-forwarded-for header", async () => {
    mockIncr.mockResolvedValue(1);

    await rateLimit(makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }), {
      maxRequests: 10,
      windowMs: 60_000,
    });

    const key = mockIncr.mock.calls[0][0];
    expect(key).toContain("1.2.3.4");
  });

  it("falls back to x-real-ip header", async () => {
    mockIncr.mockResolvedValue(1);

    await rateLimit(makeRequest({ "x-real-ip": "9.8.7.6" }), {
      maxRequests: 10,
      windowMs: 60_000,
    });

    const key = mockIncr.mock.calls[0][0];
    expect(key).toContain("9.8.7.6");
  });

  it("uses unknown when no IP headers present", async () => {
    mockIncr.mockResolvedValue(1);

    await rateLimit(makeRequest(), { maxRequests: 10, windowMs: 60_000 });

    const key = mockIncr.mock.calls[0][0];
    expect(key).toContain("unknown");
  });

  it("fails open when Redis throws", async () => {
    mockIncr.mockRejectedValue(new Error("Redis connection refused"));

    const result = await rateLimit(makeRequest(), { maxRequests: 5, windowMs: 60_000 });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("different prefixes produce different keys", async () => {
    mockIncr.mockResolvedValue(1);

    await rateLimit(makeRequest(), { maxRequests: 10, windowMs: 60_000, prefix: "a" });
    const keyA = mockIncr.mock.calls[0][0];

    await rateLimit(makeRequest(), { maxRequests: 10, windowMs: 60_000, prefix: "b" });
    const keyB = mockIncr.mock.calls[1][0];

    expect(keyA).not.toBe(keyB);
  });
});
