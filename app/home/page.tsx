import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { syncApplicationUser } from "@/lib/auth/sync-user";
import { AppSidebar } from "@/components/app-sidebar";
import { CompanyCard } from "@/components/companies/company-card";
import { CompanyCreateCard } from "@/components/companies/company-create-card";
import { Typography } from "@/components/ui/typography";
import { SignOutButton } from "@/components/sign-out-button";

// Temporary UI-only placeholder.
// Real companies will come from CompanyMembership in Phase 3.
const DUMMY_COMPANIES = [
  {
    id: "demo-1",
    name: "Northstar Retail",
    industry: "Retail",
    role: "Owner",
  },
  {
    id: "demo-2",
    name: "Atlas Consulting",
    industry: "Professional Services",
    role: "Manager",
  },
  {
    id: "demo-3",
    name: "Lumen Foods",
    industry: "Food & Beverage",
    role: "Advisor",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  // Validate authentication state server-side using getClaims()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData) {
    redirect("/login");
  }

  // Synchronize authenticated user with application PostgreSQL database
  const appUser = await syncApplicationUser();

  const userEmail = appUser.email;
  const userName = appUser.name || userEmail.split("@")[0] || "User";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar navigation */}
      <AppSidebar userEmail={userEmail} userName={userName} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header Bar */}
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
          {/* Welcome / Header Section */}
          <div className="space-y-1">
            <Typography variant="header-1">Welcome back, {userName}</Typography>
            <Typography variant="subtitle">
              Manage and access your companies from one place.
            </Typography>
          </div>

          {/* Your Companies Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="header-3">Your Companies</Typography>
              <Typography variant="muted" className="text-xs">
                {DUMMY_COMPANIES.length + 1} workspace options
              </Typography>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DUMMY_COMPANIES.map((company) => (
                <CompanyCard
                  key={company.id}
                  name={company.name}
                  industry={company.industry}
                  role={company.role}
                />
              ))}

              <CompanyCreateCard />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
