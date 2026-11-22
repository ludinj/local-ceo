import { getCompanyContext } from "@/lib/auth/company-context";
import {
  BUILT_IN_ROLES,
  hasPermission,
  requirePermission,
} from "@/lib/auth/rbac";
import { CompanyMembersPageContent } from "@/features/companies/components/company-members";
import {
  getAssignableInvitationRoles,
  INVITABLE_ROLES,
} from "@/lib/invitations/policy";
import type { InvitationStatus } from "@/lib/generated/prisma/client";

interface CompanyMembersPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    tab?: string | string[];
    roles?: string | string[];
    status?: string | string[];
    inviteRoles?: string | string[];
  }>;
}

function parsePageValue(rawValue: string | string[] | undefined): number {
  const value = Array.isArray(rawValue) ? rawValue[0] : (rawValue ?? "1");
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseSearchValue(rawValue: string | string[] | undefined): string {
  const value = Array.isArray(rawValue) ? rawValue.join(" ") : (rawValue ?? "");
  return value.trim();
}

function parseRoleValues(rawValue: string | string[] | undefined): string[] {
  const rawRoles = Array.isArray(rawValue)
    ? rawValue.flatMap((value) => value.split(","))
    : (rawValue ?? "").split(",");

  return Array.from(
    new Set(
      rawRoles
        .map((role) => role.trim().toUpperCase())
        .filter((role) => Boolean(role))
        .filter((role) =>
          BUILT_IN_ROLES.includes(role as (typeof BUILT_IN_ROLES)[number]),
        ),
    ),
  );
}

function parseInvitationRoles(
  rawValue: string | string[] | undefined,
): string[] {
  const rawRoles = Array.isArray(rawValue)
    ? rawValue.flatMap((value) => value.split(","))
    : (rawValue ?? "").split(",");

  const selectedRoles = new Set(
    rawRoles.map((role) => role.trim().toUpperCase()),
  );

  return INVITABLE_ROLES.filter((role) => selectedRoles.has(role));
}

function parseInvitationStatuses(
  rawValue: string | string[] | undefined,
): InvitationStatus[] {
  if (rawValue === undefined) {
    return ["PENDING"];
  }

  const values = Array.isArray(rawValue)
    ? rawValue.flatMap((value) => value.split(","))
    : rawValue.split(",");

  const normalizedValues = values.map((value) => value.trim().toUpperCase());

  if (normalizedValues.includes("ALL")) {
    return [];
  }

  const validStatuses: InvitationStatus[] = [
    "PENDING",
    "ACCEPTED",
    "DECLINED",
    "EXPIRED",
    "REVOKED",
  ];

  const selected = new Set(normalizedValues);

  const statuses = validStatuses.filter((status) => selected.has(status));

  return statuses.length > 0 ? statuses : ["PENDING"];
}

export default async function CompanyMembersPage({
  params,
  searchParams,
}: CompanyMembersPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams;

  const rawTab = Array.isArray(resolvedParams.tab)
    ? resolvedParams.tab[0]
    : resolvedParams.tab;

  const tab = rawTab === "invitations" ? "invitations" : "members";

  const context = await getCompanyContext(slug);

  requirePermission(context, "members.read");

  const canInvite = hasPermission(context, "members.invite");

  // Protect direct access to the Invitations tab.
  if (tab === "invitations") {
    requirePermission(context, "members.invite");
  }

  const page = parsePageValue(resolvedParams.page);
  const search = parseSearchValue(resolvedParams.search);
  const roles = parseRoleValues(resolvedParams.roles);

  const invitationStatuses = parseInvitationStatuses(resolvedParams.status);
  const invitationRoles = parseInvitationRoles(resolvedParams.inviteRoles);

  const allowedRoles = canInvite
    ? [...getAssignableInvitationRoles(context.membership.role)]
    : [];

  return (
    <CompanyMembersPageContent
      companyName={context.company.name}
      companyId={context.company.id}
      companySlug={slug}
      page={page}
      search={search}
      roles={roles}
      tab={tab}
      canInvite={canInvite}
      allowedRoles={allowedRoles}
      invitationStatuses={invitationStatuses}
      invitationRoles={invitationRoles}
    />
  );
}
