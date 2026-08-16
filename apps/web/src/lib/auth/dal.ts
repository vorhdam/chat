import "server-only";

import { cache } from "@repo/cache";
import prisma from "@repo/database";
import { Profile, SessionPayload, User } from "./definitions";
import { verifySession } from "./sessions";

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

export const getProfile = async (id?: string): Promise<Profile | null> => {
  const session = await verifySession();
  if (!session?.userId && !id) return null;

  const lookup = id ? id : session?.userId;

  try {
    const profile: Profile | null = await cache(
      `profile:${lookup}`,
      await prisma.user.findFirst({
        where: { id: lookup },
        select: { id: true, name: true, username: true, avatarUrl: true },
      }),
    );
    return profile;
  } catch {
    return null;
  }
};

export const getSession = async (): Promise<SessionPayload | null> => {
  const session = await verifySession();
  if (!session?.userId) return null;
  return session;
};
