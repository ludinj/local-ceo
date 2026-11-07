"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCompanyContext } from "@/lib/auth/company-context";
import { requirePermission } from "@/lib/auth/rbac";
import { syncApplicationUser } from "@/lib/auth/sync-user";
import { getAuthenticatedInvitationRecipient } from "@/lib/invitations/recipient";
import { INVITABLE_ROLES } from "@/lib/invitations/policy";

import {
  generateInvitationToken,
  hashInvitationToken,
  normalizeInvitationEmail,
} from "@/lib/invitations/service";
import { canAssignInvitationRole } from "@/lib/invitations/policy";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type CreateInvitationInput = {
  companySlug: string;
  email: string;
  role: string;
};

type CreateInvitationResult =
  | { success: true; invitationId: string }
  | { success: false; error: string };

const INVITATION_DURATION_DAYS = 7;

export async function createInvitationAction(
  input: CreateInvitationInput
): Promise<CreateInvitationResult> {
  try {
    const companySlug = input.companySlug?.trim();

    if (!companySlug || typeof input.email !== "string") {
      return {
        success: false,
        error: "Invalid invitation data.",
      };
    }

    if (input.email.length > 254) {
      return {
        success: false,
        error: "Email address is too long.",
      };
    }

    const email = normalizeInvitationEmail(input.email);

    // Resolve company access from the authenticated session.
    const context = await getCompanyContext(companySlug);

    // This is the primary authorization check.
    requirePermission(context, "members.invite");

    // The inviter is never supplied by the browser.
    const actor = await syncApplicationUser();
    const companyId = context.company.id;
    const actorRole = context.membership.role;
    const targetRole = input.role?.trim().toUpperCase();

    if (!canAssignInvitationRole(actorRole, targetRole)) {
      return {
        success: false,
        error: "You cannot invite a member with this role.",
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    const invitationId = await prisma.$transaction(async (tx) => {
      // Mark previously expired pending invitations.
      await tx.invitation.updateMany({
        where: {
          companyId,
          invitedEmail: {
            equals: email,
            mode: "insensitive",
          },
          status: "PENDING",
          expiresAt: { lte: new Date() },
        },
        data: { status: "EXPIRED" },
      });

      // A current member cannot be invited again.
      const membership = await tx.companyMembership.findFirst({
        where: {
          companyId,
          user: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        },
        select: { id: true },
      });

      if (membership) {
        throw new Error("ALREADY_MEMBER");
      }

      const pending = await tx.invitation.findFirst({
        where: {
          companyId,
          invitedEmail: {
            equals: email,
            mode: "insensitive",
          },
          status: "PENDING",
        },
        select: { id: true },
      });

      if (pending) {
        throw new Error("ALREADY_INVITED");
      }

      const token = generateInvitationToken();
      const expiresAt = new Date(
        Date.now() + INVITATION_DURATION_DAYS * 24 * 60 * 60 * 1000
      );

      const invitation = await tx.invitation.create({
        data: {
          companyId,
          inviterId: actor.id,
          invitedEmail: email,
          role: targetRole,
          tokenHash: hashInvitationToken(token),
          expiresAt,
          status: "PENDING",
        },
        select: { id: true },
      });

      // Only existing users can receive in-app
      // notifications immediately.
      if (existingUser) {
        await tx.notification.create({
          data: {
            recipientId: existingUser.id,
            companyId,
            actorType: "USER",
            actorId: actor.id,
            type: "INVITATION",
            title: "Company invitation",
            message:
              `You have been invited to join ` +
              `${context.company.name} as ${targetRole}.`,
            metadata: {
              invitationId: invitation.id,
              companyId,
              role: targetRole,
            },
            link: "/home",
          },
        });
      }

      return invitation.id;
    });

    revalidatePath(`/companies/${companySlug}/members`);
    revalidatePath("/home");

    return {
      success: true,
      invitationId,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ALREADY_MEMBER") {
        return {
          success: false,
          error: "This user is already a company member.",
        };
      }

      if (error.message === "ALREADY_INVITED") {
        return {
          success: false,
          error: "A pending invitation already exists.",
        };
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          error: "A pending invitation already exists.",
        };
      }
    }

    // Log internal details server-side, not to clients.
    console.error("Invitation creation failed:", error);

    return {
      success: false,
      error: "Unable to create the invitation.",
    };
  }
}

type InvitationResponseResult =
  | {
      success: true;
      companySlug: string;
    }
  | {
      success: false;
      error: string;
    };

export async function acceptInvitationAction(
  invitationId: string
): Promise<InvitationResponseResult> {
  try {
    const recipient = await getAuthenticatedInvitationRecipient();

    if (typeof invitationId !== "string" || !UUID_REGEX.test(invitationId)) {
      return {
        success: false,
        error: "Invalid invitation.",
      };
    }

    const companySlug = await prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({
        where: { id: invitationId },
        select: {
          id: true,
          companyId: true,
          invitedEmail: true,
          role: true,
          status: true,
          expiresAt: true,
          company: {
            select: {
              slug: true,
            },
          },
        },
      });

      // Do not expose invitations belonging to another user.
      if (
        !invitation ||
        invitation.invitedEmail.trim().toLowerCase() !== recipient.email
      ) {
        throw new Error("INVITATION_NOT_FOUND");
      }

      if (invitation.status !== "PENDING") {
        throw new Error("INVITATION_NOT_AVAILABLE");
      }

      if (invitation.expiresAt <= new Date()) {
        throw new Error("INVITATION_EXPIRED");
      }

      // Never accept an unsupported or OWNER role.
      if (!INVITABLE_ROLES.some((role) => role === invitation.role)) {
        throw new Error("INVALID_INVITATION_ROLE");
      }

      const existingMembership = await tx.companyMembership.findUnique({
        where: {
          userId_companyId: {
            userId: recipient.id,
            companyId: invitation.companyId,
          },
        },
        select: { id: true },
      });

      if (existingMembership) {
        throw new Error("ALREADY_MEMBER");
      }

      // Conditional update prevents two requests from
      // successfully claiming the same invitation.
      const now = new Date();

      const claimed = await tx.invitation.updateMany({
        where: {
          id: invitation.id,
          status: "PENDING",
          expiresAt: { gt: now },
        },
        data: {
          status: "ACCEPTED",
          acceptedAt: now,
        },
      });

      if (claimed.count !== 1) {
        throw new Error("INVITATION_NOT_AVAILABLE");
      }

      // Must succeed in the same transaction.
      await tx.companyMembership.create({
        data: {
          userId: recipient.id,
          companyId: invitation.companyId,
          role: invitation.role,
        },
      });

      return invitation.company.slug;
    });

    revalidatePath("/home");
    revalidatePath(`/companies/${companySlug}`);
    revalidatePath(`/companies/${companySlug}/members`);

    return {
      success: true,
      companySlug,
    };
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "UNAUTHENTICATED":
        case "EMAIL_NOT_VERIFIED":
          return {
            success: false,
            error: "A verified login is required.",
          };

        case "INVITATION_NOT_FOUND":
          return {
            success: false,
            error: "Invitation not found.",
          };

        case "INVITATION_EXPIRED":
          return {
            success: false,
            error: "This invitation has expired.",
          };

        case "INVITATION_NOT_AVAILABLE":
          return {
            success: false,
            error: "This invitation is no longer available.",
          };

        case "ALREADY_MEMBER":
          return {
            success: false,
            error: "You are already a member of this company.",
          };

        case "INVALID_INVITATION_ROLE":
          return {
            success: false,
            error: "This invitation contains an invalid role.",
          };
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "You are already a member of this company.",
        };
      }

      if (error.code === "P2034") {
        return {
          success: false,
          error: "The invitation was modified. Please try again.",
        };
      }
    }
    console.error("Accept invitation failed:", error);

    return {
      success: false,
      error: "Unable to accept the invitation.",
    };
  }
}

export async function declineInvitationAction(
  invitationId: string
): Promise<InvitationResponseResult> {
  try {
    const recipient = await getAuthenticatedInvitationRecipient();

    if (typeof invitationId !== "string" || !UUID_REGEX.test(invitationId)) {
      return {
        success: false,
        error: "Invalid invitation.",
      };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        invitedEmail: true,
        company: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (
      !invitation ||
      invitation.invitedEmail.trim().toLowerCase() !== recipient.email
    ) {
      return {
        success: false,
        error: "Invitation not found.",
      };
    }

    const now = new Date();

    const result = await prisma.invitation.updateMany({
      where: {
        id: invitation.id,
        status: "PENDING",
        expiresAt: { gt: now },
      },
      data: {
        status: "DECLINED",
        declinedAt: now,
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "This invitation is no longer available.",
      };
    }

    revalidatePath("/home");

    return {
      success: true,
      companySlug: invitation.company.slug,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHENTICATED" ||
        error.message === "EMAIL_NOT_VERIFIED")
    ) {
      return {
        success: false,
        error: "A verified login is required.",
      };
    }

    console.error("Decline invitation failed:", error);

    return {
      success: false,
      error: "Unable to decline the invitation.",
    };
  }
}

type RevokeInvitationInput = {
  companySlug: string;
  invitationId: string;
};

type RevokeInvitationResult =
  | { success: true }
  | { success: false; error: string };

export async function revokeInvitationAction(
  input: RevokeInvitationInput
): Promise<RevokeInvitationResult> {
  try {
    if (
      !input ||
      typeof input.companySlug !== "string" ||
      !input.companySlug.trim() ||
      typeof input.invitationId !== "string" ||
      !UUID_REGEX.test(input.invitationId)
    ) {
      return {
        success: false,
        error: "Invalid invitation data.",
      };
    }

    const companySlug = input.companySlug.trim();

    // Verify authentication and company membership.
    const context = await getCompanyContext(companySlug);

    // Only authorized company members can revoke invitations.
    requirePermission(context, "members.invite");

    // Scope the invitation lookup to the authorized company.
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: input.invitationId,
        companyId: context.company.id,
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found.",
      };
    }

    // The actor must be allowed to manage the invited role.
    if (!canAssignInvitationRole(context.membership.role, invitation.role)) {
      return {
        success: false,
        error: "You cannot revoke an invitation for this role.",
      };
    }

    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: "This invitation is no longer pending.",
      };
    }

    const now = new Date();

    // Atomic conditional update.
    // Acceptance and revocation cannot both succeed.
    const result = await prisma.invitation.updateMany({
      where: {
        id: invitation.id,
        companyId: context.company.id,
        status: "PENDING",
        expiresAt: {
          gt: now,
        },
      },
      data: {
        status: "REVOKED",
        revokedAt: now,
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "This invitation is no longer available.",
      };
    }

    revalidatePath(`/companies/${companySlug}/members`);
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Revoke invitation failed:", error);

    return {
      success: false,
      error: "Unable to revoke the invitation.",
    };
  }
}
