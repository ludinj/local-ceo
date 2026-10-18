import { Pagination } from "@/components/ui/pagination";
import { Typography } from "@/components/ui/typography";
import { CompanyMemberRow } from "@/features/companies/components/company-member-row";
import { getCompanyMembers } from "@/features/companies/queries";

interface CompanyMembersListProps {
  companyId: string;
  page: number;
  search: string;
  roles: string[];
}

export async function CompanyMembersList({
  companyId,
  page,
  search,
  roles,
}: CompanyMembersListProps) {
  const result = await getCompanyMembers({
    companyId,
    page,
    limit: 10,
    search,
    roles,
  });

  const activeFilters = Boolean(search || roles.length > 0);
  const totalMembersLabel =
    result.total === 1 ? "1 member" : `${result.total} members`;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Typography variant="small" className="text-sm font-medium text-foreground">
          {totalMembersLabel}
        </Typography>
      </div>

      {result.items.length === 0 && !activeFilters ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No members found.
        </div>
      ) : null}

      {result.items.length === 0 && activeFilters ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <Typography variant="small" className="text-sm text-foreground">
            No members match your filters.
          </Typography>
        </div>
      ) : null}

      {result.items.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-border bg-muted/20 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Member</div>
            <div>Role</div>
            <div>Joined</div>
          </div>

          <div>
            {result.items.map((member) => (
              <CompanyMemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      ) : null}

      <Pagination page={result.page} totalPages={result.totalPages} />
    </>
  );
}
