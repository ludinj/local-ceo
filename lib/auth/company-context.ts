import "server-only";

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { syncApplicationUser } from "@/lib/auth/sync-user";
import { prisma } from "@/lib/prisma";
import type {
  Company,
  CompanyMembership,
  User as PrismaUser,
} from "@/lib/generated/prisma/client";

export interface CompanyContext {
  user: PrismaUser;
  company: Company;
  membership: CompanyMembership;
}

/**
 * Server-side abstraction for retrieving and verifying company workspace context.
 *
 * Security & Authorization:
 * 1. Validates authenticated Supabase session and synchronizes Local CEO application user.
 * 2. Resolves Company by `slug`.
 * 3. Verifies `CompanyMembership` server-side for (userId, companyId).
 *
 * Failure modes:
 * - Unauthenticated user: Redirects to `/login`.
 * - Nonexistent company or non-member user: Calls `notFound()`.
 */
export async function getCompanyContext(slug: string): Promise<CompanyContext> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData) {
    redirect("/login");
  }

  const user = await syncApplicationUser();

  const company = await prisma.company.findUnique({
    where: { slug },
  });

  if (!company) {
    notFound();
  }

  const membership = await prisma.companyMembership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: company.id,
      },
    },
  });

  if (!membership) {
    // Non-member access attempt. Return notFound() to prevent leaking company existence.
    notFound();
  }

  return {
    user,
    company,
    membership,
  };
}
