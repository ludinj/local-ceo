import { Pagination } from "@/components/ui/pagination";
import { Typography } from "@/components/ui/typography";
import { MemberRoleBadge } from "@/features/companies/components/member-role-badge";
import { getCompanyInvitations } from "@/features/invitations/queries";
import { RevokeInvitationButton } from "@/features/invitations/components/revoke-invitation-button";

import type { InvitationStatus } from "@/lib/generated/prisma/client";

interface CompanyInvitationsListProps {
  companySlug: string;
  page: number;
  statuses: InvitationStatus[];
  roles: string[];
  allowedRoles: string[];
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: Date): string {
  return DATE_FORMATTER.format(new Date(date));
}

function InvitationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    ACCEPTED: "bg-green-500/10 text-green-700 dark:text-green-400",
    DECLINED: "bg-muted text-muted-foreground",
    EXPIRED: "bg-muted text-muted-foreground",
    REVOKED: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={[
        "inline-flex rounded-md px-2 py-1",
        "text-xs font-medium",
        styles[status] ?? styles.EXPIRED,
      ].join(" ")}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export async function CompanyInvitationsList({
  companySlug,
  page,
  statuses,
  roles,
  allowedRoles,
}: CompanyInvitationsListProps) {
  const result = await getCompanyInvitations(companySlug, {
    page,
    pageSize: 10,
    statuses,
    roles,
  });

  const totalLabel =
    result.total === 1 ? "1 invitation" : `${result.total} invitations`;

  const hasFilters = statuses.length > 0 || roles.length > 0;

  return (
    <div className="space-y-4">
      <Typography
        variant="small"
        className="text-sm font-medium text-foreground"
      >
        {totalLabel}
      </Typography>

      {result.invitations.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
          <Typography variant="muted" className="text-sm">
            {hasFilters
              ? "No invitations match your filters."
              : "No invitations have been created yet."}
          </Typography>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
          <div className="min-w-[850px]">
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_90px] gap-4 border-b border-border bg-muted/20 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Email</div>
              <div>Role</div>
              <div>Status</div>
              <div>Created</div>
              <div>Expires</div>
              <div>Actions</div>
            </div>

            {result.invitations.map((invitation) => {
              const canRevoke =
                invitation.effectiveStatus === "PENDING" &&
                allowedRoles.includes(invitation.role);

              return (
                <div
                  key={invitation.id}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_90px] items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
                >
                  <Typography
                    variant="small"
                    className="truncate text-sm font-medium"
                  >
                    {invitation.invitedEmail}
                  </Typography>

                  <MemberRoleBadge role={invitation.role} />

                  <InvitationStatusBadge status={invitation.effectiveStatus} />

                  <Typography variant="muted" className="text-xs">
                    {formatDate(invitation.createdAt)}
                  </Typography>

                  <Typography variant="muted" className="text-xs">
                    {formatDate(invitation.expiresAt)}
                  </Typography>

                  <div>
                    {canRevoke ? (
                      <RevokeInvitationButton
                        companySlug={companySlug}
                        invitationId={invitation.id}
                        email={invitation.invitedEmail}
                      />
                    ) : (
                      <Typography variant="muted" className="text-xs">
                        —
                      </Typography>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
