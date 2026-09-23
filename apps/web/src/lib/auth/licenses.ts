import "server-only";

import { redirect } from "@/i18n/navigation";
import config from "@repo/config";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { CookiePayload, LicensePayload, LicensedRoute } from "./definitions";

const key = new TextEncoder().encode(process.env.JWT_SECRET!);
const { cookieName, headerName, duration } = config.license;
const expiresAt = new Date(Date.now() + duration);
const cookieOptions: CookiePayload = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  expires: expiresAt,
  sameSite: "lax",
  path: "/",
};

type LicenseData = Omit<LicensePayload, "token">;

export async function encrypt(payload: LicenseData): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key);
}

export async function decrypt(license: string): Promise<LicenseData | null> {
  if (!license) return null;
  try {
    const { payload } = await jwtVerify(license, key, {
      algorithms: ["HS256"],
    });
    return payload as LicenseData;
  } catch {
    return null;
  }
}

export async function createLicense({
  scope,
  userId,
  redirectUrl,
}: {
  scope: LicensedRoute;
  userId: string;
  redirectUrl?: string;
}): Promise<LicensePayload> {
  const signed = false;
  const token = await encrypt({ scope, userId, signed, expiresAt });
  (await cookies()).set(cookieName, token, cookieOptions);
  if (redirectUrl) await redirect(redirectUrl);
  return { token, scope, userId, signed, expiresAt };
}

export async function verifyLicense(): Promise<LicensePayload | null> {
  const cookie = (await cookies()).get(cookieName)?.value || "";
  const header = (await headers()).get(headerName);
  const bearer = header?.startsWith("Bearer ") ? header.split(" ")[1] : "";
  const token = cookie || bearer || "";
  const license = await decrypt(token);
  if (!license?.userId) return null;
  return { token, ...license };
}

export async function signLicense(): Promise<LicensePayload | null> {
  const license = await verifyLicense();
  if (!license) return null;
  const reach = { userId: license.userId, scope: license.scope };
  const token = await encrypt({ ...reach, signed: true, expiresAt });
  (await cookies()).set(cookieName, token, cookieOptions);
  return { token, ...reach, signed: true, expiresAt };
}

export async function deleteLicense() {
  const license = await verifyLicense();
  if (!license?.userId) return null;
  (await cookies()).delete(cookieName);
  return license;
}
