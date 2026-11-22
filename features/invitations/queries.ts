import "server-only";

import { prisma } from "@/lib/prisma";
import { syncApplicationUser } from "@/lib/auth/sync-user";
import { createClient } from "@/lib/supabase/server";
import { getCompanyContext } from "@/lib/auth/company-context";
import { requirePermission } from "@/lib/auth/rbac";
import { INVITABLE_ROLES } from "@/lib/invitations/policy";
import type { InvitationStatus, Prisma } from "@/lib/generated/prisma/client";

export async function getMyPendingInvitations() {
  const user = await syncApplicationUser();
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (
    error ||
    !authUser ||
    !authUser.email ||
    !authUser.email_confirmed_at ||
    authUser.id !== user.id
  ) {
    throw new Error("A verified authenticated user is required.");
  }

  const normalizedEmail = authUser.email.trim().toLowerCase();

  return prisma.invitation.findMany({
    where: {
      invitedEmail: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
      status: "PENDING",
      expiresAt: {
        gt: new Date(),
      },
      company: {
        memberships: {
          none: {
            userId: user.id,
          },
        },
      },
    },
    select: {
      id: true,
      role: true,
      status: true,
      createdAt: true,
      expiresAt: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50,
  });
}

type GetCompanyInvitationsOptions = {
  statuses?: InvitationStatus[];
  roles?: string[];
  page?: number;
  pageSize?: number;
};

export async function getCompanyInvitations(
  companySlug: string,
  options: GetCompanyInvitationsOptions = {},
) {
  const context = await getCompanyContext(companySlug);

  requirePermission(context, "members.invite");

  const {
    statuses = ["PENDING"],
    roles = [],
    page = 1,
    pageSize = 10,
  } = options;

  const validRoles = INVITABLE_ROLES.filter((role) => roles.includes(role));

  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;

  const safePageSize =
    Number.isSafeInteger(pageSize) && pageSize > 0
      ? Math.min(pageSize, 50)
      : 10;

  const now = new Date();

  // Remove duplicated statuses.
  const validStatuses: InvitationStatus[] = [
    "PENDING",
    "ACCEPTED",
    "DECLINED",
    "EXPIRED",
    "REVOKED",
  ];

  const uniqueStatuses = validStatuses.filter((status) =>
    statuses.includes(status),
  );

  // Build conditions using the effective invitation status.
  const statusConditions: Prisma.InvitationWhereInput[] = uniqueStatuses.map(
    (status) => {
      if (status === "PENDING") {
        return {
          status: "PENDING",
          expiresAt: {
            gt: now,
          },
        };
      }

      if (status === "EXPIRED") {
        return {
          OR: [
            {
              status: "EXPIRED",
            },
            {
              status: "PENDING",
              expiresAt: {
                lte: now,
              },
            },
          ],
        };
      }

      return {
        status,
      };
    },
  );

  const where: Prisma.InvitationWhereInput = {
    companyId: context.company.id,

    // Filter by one or more roles.
    ...(roles.length > 0
      ? {
          role: {
            in: validRoles,
          },
        }
      : {}),

    // No selected statuses means all statuses.
    ...(uniqueStatuses.length > 0
      ? {
          OR: statusConditions,
        }
      : {}),
  };

  const [invitations, total] = await Promise.all([
    prisma.invitation.findMany({
      where,
      select: {
        id: true,
        invitedEmail: true,
        role: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        acceptedAt: true,
        declinedAt: true,
        revokedAt: true,
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    prisma.invitation.count({
      where,
    }),
  ]);

  return {
    invitations: invitations.map((invitation) => ({
      ...invitation,
      effectiveStatus:
        invitation.status === "PENDING" && invitation.expiresAt <= now
          ? "EXPIRED"
          : invitation.status,
    })),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}
