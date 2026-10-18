import "server-only";

import { isBuiltInRole, type Role } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";

import type {
  CompanyListResult,
  GetCompanyMembersParams,
  CompanyMembersResult,
  GetUserCompaniesInput,
} from "@/features/companies/interfaces";

const COMPANY_PAGE_SIZE = 12;
const DEFAULT_COMPANY_MEMBERS_LIMIT = 10;

export async function getUserCompanies({
  userId,
  page,
  search,
  industry,
}: GetUserCompaniesInput): Promise<CompanyListResult> {
  const safePage = Math.max(1, page);

  const normalizedSearch = search.trim();
  const normalizedIndustry = industry.trim();

  const where = {
    userId,

    company: {
      ...(normalizedSearch
        ? {
            name: {
              contains: normalizedSearch,
              mode: "insensitive" as const,
            },
          }
        : {}),

      ...(normalizedIndustry
        ? {
            industry: normalizedIndustry,
          }
        : {}),
    },
  };

  const [memberships, totalItems] = await prisma.$transaction([
    prisma.companyMembership.findMany({
      where,
      skip: (safePage - 1) * COMPANY_PAGE_SIZE,
      take: COMPANY_PAGE_SIZE,

      orderBy: {
        company: {
          name: "asc",
        },
      },

      select: {
        role: true,

        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            industry: true,
            countryCode: true,
            createdAt: true,
          },
        },
      },
    }),

    prisma.companyMembership.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / COMPANY_PAGE_SIZE);

  return {
    items: memberships.map(({ role, company }) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      industry: company.industry,
      countryCode: company.countryCode,
      createdAt: company.createdAt,
      role,
    })),

    pagination: {
      page: safePage,
      limit: COMPANY_PAGE_SIZE,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

export async function getUserCompanyIndustries(
  userId: string,
): Promise<string[]> {
  const memberships = await prisma.companyMembership.findMany({
    where: {
      userId,
      company: {
        industry: {
          not: null,
        },
      },
    },

    select: {
      company: {
        select: {
          industry: true,
        },
      },
    },
  });

  return Array.from(
    new Set(
      memberships
        .map(({ company }) => company.industry)
        .filter((industry): industry is string => Boolean(industry)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export async function getCompanyMembers({
  companyId,
  page = 1,
  limit = DEFAULT_COMPANY_MEMBERS_LIMIT,
  search = "",
  roles = [],
}: GetCompanyMembersParams): Promise<CompanyMembersResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.floor(limit)
      : DEFAULT_COMPANY_MEMBERS_LIMIT;

  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const normalizedRoles = Array.from(
    new Set(
      (roles ?? [])
        .map((role) => String(role).trim().toUpperCase())
        .filter((role): role is Role => isBuiltInRole(role)),
    ),
  );

  const where = {
    companyId,
    ...(normalizedSearch
      ? {
          OR: [
            {
              user: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              user: {
                email: {
                  contains: normalizedSearch,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
    ...(normalizedRoles.length
      ? {
          role: {
            in: normalizedRoles,
          },
        }
      : {}),
  };

  const [memberships, total] = await prisma.$transaction([
    prisma.companyMembership.findMany({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.companyMembership.count({
      where,
    }),
  ]);

  const totalPages = total === 0 ? 1 : Math.ceil(total / safeLimit);

  return {
    items: memberships.map((membership) => ({
      id: membership.id,
      role: membership.role,
      createdAt: membership.createdAt,
      user: {
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
      },
    })),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}
