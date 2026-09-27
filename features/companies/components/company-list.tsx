import { CompanyCard } from "@/features/companies/components/company-card";
import { CompanyCreateCard } from "@/features/companies/components/company-create-card";
import { CompanyPagination } from "@/features/companies/components/company-pagination";
import { getUserCompanies } from "@/features/companies/queries";

interface CompanyListProps {
  userId: string;
  page: number;
  search: string;
  industry: string;
}

export async function CompanyList({
  userId,
  page,
  search,
  industry,
}: CompanyListProps) {
  const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
  const safeSearch = search.trim();
  const safeIndustry = industry.trim();

  const result = await getUserCompanies({
    userId,
    page: safePage,
    search: safeSearch,
    industry: safeIndustry,
  });

  const activeFilters = Boolean(safeSearch || safeIndustry);

  if (result.items.length === 0 && activeFilters) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No companies match your current filters.
      </div>
    );
  }

  const companyCards = result.items.map((company) => (
    <CompanyCard
      key={company.id}
      name={company.name}
      slug={company.slug}
      industry={company.industry ?? "Not specified"}
      role={company.role}
    />
  ));

  const showCreateCard = safePage === 1 && !activeFilters;

  if (result.items.length === 0 && !activeFilters) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CompanyCreateCard />
      </div>
    );
  }

  if (showCreateCard) {
    companyCards.push(<CompanyCreateCard key="create-company-card" />);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companyCards}
      </div>

      <CompanyPagination pagination={result.pagination} />
    </div>
  );
}
