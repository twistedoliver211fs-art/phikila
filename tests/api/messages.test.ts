import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/helpers", () => ({
  getCurrentSchoolId: vi.fn(),
}));

vi.mock("@/lib/services/message", () => ({
  getMessages: vi.fn(),
  getUnreadCount: vi.fn(),
  sendMessage: vi.fn(),
}));

import { GET, POST } from "@/app/api/messages/route";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import {
  getMessages,
  getUnreadCount,
  sendMessage,
} from "@/lib/services/message";

const mockUser = { id: "user-1", email: "test@test.com" };
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  },
};

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(url, options as import("next/dist/server/web/spec-extension/request").RequestInit);
}

describe("GET /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(getCurrentSchoolId).mockResolvedValue("school-1");
  });

  it("returns messages and unread count for a user", async () => {
    const messages = [{ id: "msg-1", content: "Hello" }];
    vi.mocked(getMessages).mockResolvedValue(messages as never);
    vi.mocked(getUnreadCount).mockResolvedValue(3);

    const req = makeRequest("http://localhost/api/messages");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.messages).toEqual(messages);
    expect(body.unreadCount).toBe(3);
    expect(getMessages).toHaveBeenCalledWith("school-1", "user-1");
    expect(getUnreadCount).toHaveBeenCalledWith("school-1", "user-1");
  });

  it("returns 400 when no active school", async () => {
    vi.mocked(getCurrentSchoolId).mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/messages");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("No active school");
  });
});

describe("POST /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(getCurrentSchoolId).mockResolvedValue("school-1");
  });

  it("sends a message with valid params", async () => {
    const message = {
      id: "msg-1",
      senderId: "user-1",
      recipientId: "user-2",
      content: "Hello there",
    };
    vi.mocked(sendMessage).mockResolvedValue(message as never);

    const req = makeRequest("http://localhost/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: "user-2",
        content: "Hello there",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toEqual(message);
    expect(sendMessage).toHaveBeenCalledWith({
      schoolId: "school-1",
      senderId: "user-1",
      recipientId: "user-2",
      subject: undefined,
      content: "Hello there",
    });
  });

  it("sends a message with subject", async () => {
    vi.mocked(sendMessage).mockResolvedValue({ id: "msg-2" } as never);

    const req = makeRequest("http://localhost/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: "user-2",
        subject: "Meeting",
        content: "Please attend",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Meeting" })
    );
  });

  it("returns 400 without recipientId or content", async () => {
    const req = makeRequest("http://localhost/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 400 without content", async () => {
    const req = makeRequest("http://localhost/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: "user-2" }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 400 when no active school", async () => {
    vi.mocked(getCurrentSchoolId).mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: "user-2", content: "Hi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
