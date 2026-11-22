import { Suspense } from "react";
import Link from "next/link";

import { Typography } from "@/components/ui/typography";
import { CompanyMembersFilters } from "@/features/companies/components/company-members-filters";
import { CompanyMembersList } from "@/features/companies/components/company-members-list";
import { CompanyMembersTableSkeleton } from "@/features/companies/components/company-members-table-skeleton";
import { InviteMemberDialog } from "@/features/invitations/components/invite-member-dialog";
import { CompanyInvitationsFilters } from "@/features/invitations/components/company-invitations-filters";
import { CompanyInvitationsList } from "@/features/invitations/components/company-invitations-list";
import type { InvitationStatus } from "@/lib/generated/prisma/client";

type MembersTab = "members" | "invitations";

interface CompanyMembersPageContentProps {
  companyName: string;
  companyId: string;
  companySlug: string;
  page: number;
  search: string;
  roles: string[];
  tab: MembersTab;
  canInvite: boolean;
  allowedRoles: string[];
  invitationStatuses: InvitationStatus[];
  invitationRoles: string[];
}

export function CompanyMembersPageContent({
  companyName,
  companyId,
  companySlug,
  page,
  search,
  roles,
  tab,
  canInvite,
  allowedRoles,
  invitationStatuses,
  invitationRoles,
}: CompanyMembersPageContentProps) {
  const basePath = `/companies/${encodeURIComponent(companySlug)}/members`;

  const tabs = [
    {
      label: "Members",
      value: "members",
      href: basePath,
    },
    ...(canInvite
      ? [
          {
            label: "Invitations",
            value: "invitations",
            href: `${basePath}?tab=invitations`,
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-6xl space-y-8 p-6 md:p-10">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <Typography variant="header-2">Members</Typography>

            <Typography variant="muted" className="text-sm">
              Manage members and invitations for {companyName}.
            </Typography>
          </div>

          {canInvite && allowedRoles.length > 0 ? (
            <InviteMemberDialog
              companySlug={companySlug}
              allowedRoles={allowedRoles}
            />
          ) : null}
        </div>

        <div className="border-b border-border pt-4">
          <nav
            aria-label="Members and invitations"
            className="flex items-center gap-6"
          >
            {tabs.map((item) => {
              const isActive = tab === item.value;

              return (
                <Link
                  key={item.value}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "inline-flex items-center border-b-2 px-1 pb-3",
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {tab === "members" ? (
        <>
          <CompanyMembersFilters search={search} roles={roles} />

          <Suspense
            key={`${page}-${search}-${roles.join(",")}`}
            fallback={<CompanyMembersTableSkeleton />}
          >
            <CompanyMembersList
              companyId={companyId}
              page={page}
              search={search}
              roles={roles}
            />
          </Suspense>
        </>
      ) : (
        <>
          <CompanyInvitationsFilters
            statuses={invitationStatuses}
            roles={invitationRoles}
          />

          <Suspense
            key={`${page}-${invitationStatuses.join(",")}-${invitationRoles.join(",")}`}
            fallback={<CompanyMembersTableSkeleton />}
          >
            <CompanyInvitationsList
              companySlug={companySlug}
              page={page}
              statuses={invitationStatuses}
              roles={invitationRoles}
              allowedRoles={allowedRoles}
            />
          </Suspense>
        </>
      )}
    </div>
  );
}
