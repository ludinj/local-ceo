import { ReactNode } from "react";
import { getCompanyContext } from "@/lib/auth/company-context";
import { CompanySidebar } from "@/features/companies/components/company-sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { Typography } from "@/components/ui/typography";

interface CompanyLayoutProps {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyLayout({
  children,
  params,
}: CompanyLayoutProps) {
  const { slug } = await params;
  const context = await getCompanyContext(slug);

  const { company, membership, user } = context;
  const userEmail = user.email;
  const userName = user.name || userEmail.split("@")[0] || "User";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Company Workspace Sidebar */}
      <CompanySidebar
        company={company}
        membership={membership}
        userEmail={userEmail}
        userName={userName}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
              {company.name.charAt(0)}
            </div>
            <Typography variant="small" className="font-semibold text-sm text-sidebar-foreground truncate max-w-40">
              {company.name}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography variant="muted" className="text-xs truncate max-w-32">
              {userEmail}
            </Typography>
            <SignOutButton variant="icon" />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
