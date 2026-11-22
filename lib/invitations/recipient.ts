import "server-only";

import { syncApplicationUser } from "@/lib/auth/sync-user";
import { createClient } from "@/lib/supabase/server";
import { normalizeInvitationEmail } from "./service";

export async function getAuthenticatedInvitationRecipient() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!user.email || !user.email_confirmed_at) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const applicationUser = await syncApplicationUser();

  if (applicationUser.id !== user.id) {
    throw new Error("IDENTITY_MISMATCH");
  }

  return {
    id: applicationUser.id,
    email: normalizeInvitationEmail(user.email),
  };
}
