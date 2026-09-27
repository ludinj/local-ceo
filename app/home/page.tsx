import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { syncApplicationUser } from "@/lib/auth/sync-user";
import { AppSidebar } from "@/components/app-sidebar";
import { Typography } from "@/components/ui/typography";
import { SignOutButton } from "@/components/sign-out-button";
import { CompanyFilters } from "@/features/companies/components/company-filters";
import { CompanyList } from "@/features/companies/components/company-list";
import { CompanyListSkeleton } from "@/features/companies/components/company-list-skeleton";
import { getUserCompanyIndustries } from "@/features/companies/queries";

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    industry?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData) {
    redirect("/login");
  }

  const appUser = await syncApplicationUser();
  const params = await searchParams;

  const pageParam = Number(params.page ?? "1");
  const page =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const search = params.search ?? "";
  const industry = params.industry ?? "";

  const industries = await getUserCompanyIndustries(appUser.id);
  const userEmail = appUser.email;
  const userName = appUser.name || userEmail.split("@")[0] || "User";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar userEmail={userEmail} userName={userName} />

      <main className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
              LC
            </div>
            <span className="font-semibold text-sm text-sidebar-foreground">
              Local CEO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground truncate max-w-35">
              {userEmail}
            </span>
            <SignOutButton variant="icon" />
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-6xl space-y-8">
          <div className="space-y-1">
            <Typography variant="header-1">Welcome back, {userName}</Typography>
            <Typography variant="subtitle">
              Manage and access your companies from one place.
            </Typography>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Typography variant="header-3">Your Companies</Typography>
            </div>

            <CompanyFilters industries={industries} />

            <Suspense
              key={`${page}-${search}-${industry}`}
              fallback={<CompanyListSkeleton />}
            >
              <CompanyList
                userId={appUser.id}
                page={page}
                search={search}
                industry={industry}
              />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}
