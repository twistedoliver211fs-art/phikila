import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(),
}));

import { middleware } from "@/middleware";
import { updateSession } from "@/lib/supabase/middleware";

function makeRequest(pathname: string, cookies?: Record<string, string>) {
  const url = `http://localhost${pathname}`;
  const req = new NextRequest(url);
  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value);
    }
  }
  return req;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to updateSession", async () => {
    vi.mocked(updateSession).mockResolvedValue(new Response("ok") as import("next/server").NextResponse);

    const req = makeRequest("/principal");
    await middleware(req);

    expect(updateSession).toHaveBeenCalledWith(req);
  });

  it("returns the response from updateSession", async () => {
    const mockResponse = new Response("redirected", { status: 307 }) as import("next/server").NextResponse;
    vi.mocked(updateSession).mockResolvedValue(mockResponse);

    const req = makeRequest("/login");
    const res = await middleware(req);

    expect(res).toBe(mockResponse);
  });

  it("passes through cookies from request", async () => {
    vi.mocked(updateSession).mockResolvedValue(new Response("ok") as import("next/server").NextResponse);

    const req = makeRequest("/teacher", {
      decimal_active_role: "teacher",
      "sb-access-token": "token-123",
    });

    await middleware(req);

    const capturedReq = vi.mocked(updateSession).mock.calls[0][0];
    expect(capturedReq.cookies.get("decimal_active_role")?.value).toBe("teacher");
    expect(capturedReq.cookies.get("sb-access-token")?.value).toBe("token-123");
  });

  it("handles all protected paths", async () => {
    vi.mocked(updateSession).mockResolvedValue(new Response("ok") as import("next/server").NextResponse);

    const protectedPaths = [
      "/dashboard",
      "/school-picker",
      "/super-admin",
      "/principal",
      "/teacher",
      "/parent",
      "/finance",
      "/secretary",
      "/admissions-officer",
      "/platform",
    ];

    for (const path of protectedPaths) {
      vi.mocked(updateSession).mockClear();
      const req = makeRequest(path);
      await middleware(req);
      expect(updateSession).toHaveBeenCalled();
    }
  });

  it("handles public paths", async () => {
    vi.mocked(updateSession).mockResolvedValue(new Response("ok") as import("next/server").NextResponse);

    const publicPaths = ["/", "/login", "/register", "/download"];

    for (const path of publicPaths) {
      vi.mocked(updateSession).mockClear();
      const req = makeRequest(path);
      await middleware(req);
      expect(updateSession).toHaveBeenCalled();
    }
  });
});
