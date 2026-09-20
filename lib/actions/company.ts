"use server";

import { prisma } from "@/lib/prisma";
import { syncApplicationUser } from "@/lib/auth/sync-user";
import { createClient } from "@/lib/supabase/server";
import {
  companyCreateInputSchema,
  type CompanyCreateInput,
  type CompanyCreatePayload,
} from "@/lib/validations/company";

export type CompanyCreateActionResult =
  | { ok: true }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Partial<Record<keyof CompanyCreatePayload, string>>;
    };

function normalizeSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "company"
  );
}

async function buildUniqueSlug(name: string): Promise<string> {
  const base = normalizeSlug(name);
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

export async function createCompanyAction(
  input: CompanyCreateInput
): Promise<CompanyCreateActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  const parsed = companyCreateInputSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof CompanyCreatePayload, string>> = {};

    for (const [key, value] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      const typedKey = key as keyof CompanyCreatePayload;
      fieldErrors[typedKey] = value?.[0] ?? "Invalid value.";
    }

    return {
      ok: false,
      fieldErrors,
    };
  }

  try {
    const appUser = await syncApplicationUser();
    const data = parsed.data;
    const slug = await buildUniqueSlug(data.name);

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.name.trim(),
          legalName: data.legalName ?? null,
          slug,
          countryCode: data.countryCode,
          registrationNumber: data.registrationNumber ?? null,
          industry: data.industry ?? null,
        },
      });

      await tx.companyMembership.create({
        data: {
          userId: appUser.id,
          companyId: company.id,
          role: "OWNER",
        },
      });
    });

    return { ok: true };
  } catch (error) {
    console.error("Failed to create company and owner membership", {
      authenticatedUserId: user.id,
      error,
    });

    return {
      ok: false,
      message: "Unable to create the company.",
    };
  }
}
