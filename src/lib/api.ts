import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppError, UnauthorizedError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  prefix: string;
}

type AuthenticatedHandler = (params: {
  request: NextRequest;
  user: { id: string; email: string };
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never;
  searchParams: URLSearchParams;
}) => Promise<NextResponse>;

interface CreateRouteOptions {
  rateLimit?: RateLimitConfig;
}

/**
 * Wrapper for API route handlers that:
 *  1. Authenticates the user
 *  2. Optionally rate-limits via Redis
 *  3. Catches AppErrors and returns structured JSON responses
 */
export function createRoute(
  handler: AuthenticatedHandler,
  options?: CreateRouteOptions
) {
  return async (request: NextRequest) => {
    try {
      if (options?.rateLimit) {
        const { allowed, remaining, resetAt } = await rateLimit(request, options.rateLimit);
        if (!allowed) {
          return NextResponse.json(
            { error: "RATE_LIMITED", message: "Too many requests" },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": String(options.rateLimit.maxRequests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
                "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
              },
            }
          );
        }
      }

      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new UnauthorizedError();
      }

      const searchParams = request.nextUrl.searchParams;

      return await handler({
        request,
        user: { id: user.id, email: user.email ?? "" },
        supabase,
        searchParams,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.code,
            message: error.message,
            ...(error.metadata ? { metadata: error.metadata } : {}),
          },
          { status: error.statusCode }
        );
      }

      console.error("[API] Unhandled error:", error);
      return NextResponse.json(
        { error: "INTERNAL_ERROR", message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper for webhook handlers that:
 *  1. Does NOT authenticate (webhooks use signature verification)
 *  2. Catches AppErrors and returns structured JSON responses
 */
export function createWebhookRoute(
  handler: (params: {
    request: NextRequest;
    body: string;
  }) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const body = await request.text();
      return await handler({ request, body });
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.code, message: error.message },
          { status: error.statusCode }
        );
      }

      console.error("[Webhook] Unhandled error:", error);
      return NextResponse.json(
        { error: "INTERNAL_ERROR", message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  };
}
