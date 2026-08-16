import { rateLimited } from "@/app/[locale]/(errors)/ratelimited";
import appConfig from "@repo/config";
import { rateLimit } from "@repo/ratelimit";
import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const ip = (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).replace("::1", "127.0.0.1");

  const result = await rateLimit(ip);
  const clientLimit = appConfig.ratelimit.clientLimit;

  if (!result.allowed) return await rateLimited(request, result);

  const response = await intlMiddleware(request);

  response.headers.set("X-RateLimit-Limit", clientLimit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset);

  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
