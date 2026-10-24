import "server-only";

import { cache } from "@repo/cache";
import prisma from "@repo/database";

import {
  type LicensePayload,
  type Profile,
  type SessionPayload,
  type User,
} from "./definitions";
import { verifyLicense } from "./licenses";
import { verifySession } from "./sessions";

/**
 * ## Get User
 * Gets the current user's data from their session.
 * @returns The currently logged in user (without sensitive data).
 */
export const getUser = async (): Promise<Omit<
  User,
  "password" | "otp"
> | null> => {
  const session = await verifySession();
  if (!session?.userId) return null;

  try {
    const user = await cache(
      `user:${session.userId}`,
      await prisma.user.findFirst({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          phone: true,
          twoFactorAuth: true,
          lastEmailChange: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    );

    if (!user) return null;
    const profile = await getProfile(session.userId);
    if (!profile) return null;

    return { ...user, ...profile };
  } catch {
    return null;
  }
};

/**
 * ## Get Profile
 * Gets the current user's id, name and username from their session.
 * @returns The currently logged in user's profile.
 */
export const getProfile = async (id?: string): Promise<Profile | null> => {
  const session = await verifySession();
  if (!session?.userId && !id) return null;

  const lookup = id ? id : session?.userId;

  try {
    const profile: Profile | null = await cache(
      `profile:${lookup}`,
      await prisma.user.findFirst({
        where: { id: lookup },
        select: { id: true, name: true, username: true },
      }),
    );
    return profile;
  } catch {
    return null;
  }
};

/**
 * ## Get Session
 * Gets the current user's session payload.
 * @returns The currently logged in user session.
 */
export const getSession = async (): Promise<SessionPayload | null> => {
  const session = await verifySession();
  if (!session?.userId) return null;
  return session;
};

/**
 * ## Get License
 * Gets a guest's or unverified user's license payload.
 * @returns The guest's or unverified user's license.
 */
export const getLicense = async (): Promise<LicensePayload | null> => {
  const license = await verifyLicense();
  if (!license?.email) return null;
  return license;
};
