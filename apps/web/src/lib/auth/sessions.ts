import "server-only";

import { redirect } from "@/i18n/navigation";
import config from "@repo/config";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { CookiePayload, SessionPayload } from "./definitions";

const key = new TextEncoder().encode(process.env.JWT_SECRET!);
const cookieName = config.session.cookieName;
const headerName = config.session.headerName;
export const expiresAt = new Date(Date.now() + config.session.duration);
export const cookieOptions: CookiePayload = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  expires: expiresAt,
  sameSite: "lax",
  path: "/",
};

type SessionData = Omit<SessionPayload, "token">;

export async function encrypt(payload: SessionData): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key);
}

export async function decrypt(session: string): Promise<SessionData | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionData;
  } catch {
    return null;
  }
}

export async function createSession({
  userId,
  redirectUrl,
}: {
  userId: string;
  redirectUrl: string | null;
}): Promise<SessionPayload> {
  const token = await encrypt({ userId, expiresAt });
  (await cookies()).set(cookieName, token, cookieOptions);
  if (redirectUrl) await redirect(redirectUrl);
  return { token, userId, expiresAt };
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookie = (await cookies()).get(cookieName)?.value;
  const header = (await headers()).get(headerName);
  const bearer = header?.startsWith("Bearer ") ? header.split(" ")[1] : "";
  const token = cookie || bearer || "";
  const session = await decrypt(token);
  if (!session?.userId) return null;
  return { token, ...session };
}

export async function updateSession(): Promise<SessionPayload | null> {
  const session = await verifySession();
  if (!session) return null;
  const token = await encrypt({ userId: session.userId, expiresAt });
  (await cookies()).set(cookieName, token, cookieOptions);
  return { token, userId: session.userId, expiresAt };
}

export async function deleteSession(): Promise<SessionPayload | null> {
  const session = await verifySession();
  if (!session?.userId) return null;
  (await cookies()).delete(cookieName);
  return session;
}
