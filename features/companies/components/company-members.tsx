import { Suspense } from "react";
import { Typography } from "@/components/ui/typography";
import { CompanyMembersFilters } from "@/features/companies/components/company-members-filters";
import { CompanyMembersList } from "@/features/companies/components/company-members-list";
import { CompanyMembersTableSkeleton } from "@/features/companies/components/company-members-table-skeleton";
import { InviteMemberDialog } from "@/features/invitations/components/invite-member-dialog";

interface CompanyMembersPageContentProps {
  companyName: string;
  companyId: string;
  companySlug: string;
  page: number;
  search: string;
  roles: string[];
  canInvite?: boolean;
  allowedRoles?: string[];
}

export function CompanyMembersPageContent({
  companyName,
  companyId,
  companySlug,
  page,
  search,
  roles,
  canInvite = false,
  allowedRoles = [],
}: CompanyMembersPageContentProps) {
  return (
    <div className="p-6 md:p-10 max-w-6xl space-y-8">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <Typography variant="header-2">Members</Typography>
            <Typography variant="muted" className="text-sm">
              Manage the people who have access to {companyName}.
            </Typography>
          </div>

          {canInvite && allowedRoles.length > 0 ? (
            <InviteMemberDialog
              companySlug={companySlug}
              allowedRoles={allowedRoles}
            />
          ) : null}
        </div>
      </div>

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
    </div>
  );
}
