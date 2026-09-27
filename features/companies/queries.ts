import "server-only";

import { prisma } from "@/lib/prisma";

import type {
  CompanyListQuery,
  CompanyListResult,
} from "@/features/companies/interfaces";

const COMPANY_PAGE_SIZE = 12;

interface GetUserCompaniesInput extends CompanyListQuery {
  userId: string;
}

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
  userId: string
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
        .filter((industry): industry is string => Boolean(industry))
    )
  ).sort((a, b) => a.localeCompare(b));
}
