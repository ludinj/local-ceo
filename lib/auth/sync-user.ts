import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { User as PrismaUser } from "@/lib/generated/prisma/client";

/**
 * Server-side application user synchronization helper.
 *
 * Reads the authenticated Supabase identity, extracts user metadata,
 * and upserts the user into the application's PostgreSQL database using Prisma.
 *
 * Identity mapping: Supabase auth.users.id = public.User.id (UUID)
 */
export async function syncApplicationUser(): Promise<PrismaUser> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(
      "Unauthenticated: Cannot synchronize application user without an active Supabase session."
    );
  }

  if (!user.email) {
    throw new Error(
      "Invalid user identity: Authenticated Supabase user has no email address."
    );
  }

  const userId = user.id;
  const email = user.email;

  // Extract display name from Google OAuth metadata when available
  const metadata = user.user_metadata ?? {};
  const displayName: string | null =
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined) ??
    (email.includes("@") ? email.split("@")[0] : email);

  const syncedUser = await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name: displayName,
    },
    update: {
      email,
      name: displayName,
    },
  });

  return syncedUser;
}
