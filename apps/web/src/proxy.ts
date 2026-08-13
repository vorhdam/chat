import settings from "@repo/config";
import rateLimit from "@repo/ratelimit";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const ip = (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).replace("::1", "127.0.0.1");

  const result = await rateLimit(ip);
  const limit = settings.ratelimit.clientLimit;

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Too many concurrent requests. Try again later...",
        retryAfter: result.ttl,
        limitedBy: result.limitedBy,
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.ttl.toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset,
        },
      },
    );
  }

  const response = await intlMiddleware(request);

  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset);

  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
