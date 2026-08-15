import config from "@repo/config";
import { RateLimitResult } from "@repo/ratelimit";
import { NextRequest, NextResponse } from "next/server";

export async function rateLimited(
  request: NextRequest,
  result: RateLimitResult,
) {
  if (result.allowed) return;

  const limitedBy = result.limitedBy;

  const limit =
    limitedBy === "user"
      ? config.ratelimit.clientLimit
      : config.ratelimit.globalLimit;

  const locale =
    config.i18n.locales.find(
      (locale) =>
        request.nextUrl.pathname.startsWith(`/${locale}/`) ||
        request.nextUrl.pathname === `/${locale}`,
    ) ?? config.i18n.defaultLocale;

  const rewriteUrl = new URL(`/${locale}/ratelimited`, request.url);

  const response = NextResponse.rewrite(rewriteUrl, {
    status: 429,
    request: { headers: new Headers(request.headers) },
  });

  response.headers.set("Retry-After", result.ttl.toString());
  response.headers.set("x-retry-after", result.ttl.toString());
  response.headers.set("x-limited-by", limitedBy);
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset);

  return response;
}
