import { rateLimited } from "@/app/(errors)/ratelimited";
import appConfig from "@repo/config";
import { rateLimit } from "@repo/ratelimit";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const ip = (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).replace("::1", "127.0.0.1");

  const result = await rateLimit(ip);
  const clientLimit = appConfig.ratelimit.clientLimit;

  if (!result.allowed) return await rateLimited(request, result);

  const response = NextResponse.next();

  response.headers.set("X-RateLimit-Limit", clientLimit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset);

  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
