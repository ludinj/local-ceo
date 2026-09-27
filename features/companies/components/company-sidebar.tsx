import Link from "next/link";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { SignOutButton } from "@/components/sign-out-button";
import { Typography } from "@/components/ui/typography";
import type { Company, CompanyMembership } from "@/lib/generated/prisma/client";

interface CompanySidebarProps {
  company: Company;
  membership: CompanyMembership;
  userEmail?: string;
  userName?: string;
}

interface NavItem {
  label: string;
  icon: AppIconName;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function CompanySidebar({
  company,
  membership,
  userEmail,
  userName,
}: CompanySidebarProps) {
  const slug = company.slug;

  const navSections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [
        {
          label: "Dashboard",
          icon: "dashboard",
          href: `/companies/${slug}`,
          active: true,
        },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { label: "Sales", icon: "sales", disabled: true },
        { label: "Customers", icon: "customers", disabled: true },
        { label: "Inventory", icon: "inventory", disabled: true },
        { label: "Billing", icon: "billing", disabled: true },
        { label: "Expenses", icon: "expenses", disabled: true },
      ],
    },
    {
      title: "GROWTH",
      items: [{ label: "Marketing", icon: "marketing", disabled: true }],
    },
    {
      title: "INSIGHTS",
      items: [
        { label: "Analytics", icon: "analytics", disabled: true },
        { label: "Reports", icon: "reports", disabled: true },
      ],
    },
    {
      title: "PEOPLE",
      items: [
        { label: "Employees", icon: "employees", disabled: true },
        { label: "AI Agents", icon: "agents", disabled: true },
      ],
    },
    {
      title: "COMPANY",
      items: [
        { label: "Members", icon: "members", disabled: true },
        { label: "Settings", icon: "settings", disabled: true },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground  flex-col justify-between hidden md:flex min-h-screen">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation Top: Return to Home / Company Switcher */}
        <div className="space-y-3">
          <Link
            href="/home"
            className="flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <AppIcon name="arrow-left" size={14} />
            <Typography
              variant="small"
              className="text-xs font-medium text-inherit"
            >
              Switch Company
            </Typography>
          </Link>

          {/* Selected Company Header Card */}
          <div className="flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                {company.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <Typography
                  variant="small"
                  className="font-semibold text-sm text-sidebar-foreground truncate"
                >
                  {company.name}
                </Typography>
                <Typography
                  variant="muted"
                  className="text-[11px] text-muted-foreground truncate"
                >
                  {company.industry ?? "General"}
                </Typography>
              </div>
            </div>
            <Typography
              variant="caption"
              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary shrink-0 uppercase tracking-wider"
            >
              {membership.role}
            </Typography>
          </div>
        </div>

        {/* Modular Navigation Sections */}
        <nav className="space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <Typography
                variant="caption"
                className="px-2 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/60 block"
              >
                {section.title}
              </Typography>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  if (item.disabled) {
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground/40 cursor-not-allowed select-none"
                      >
                        <span className="flex items-center gap-2.5">
                          <AppIcon
                            name={item.icon}
                            size={16}
                            className="opacity-40"
                          />
                          <Typography
                            variant="small"
                            className="text-xs text-inherit font-normal"
                          >
                            {item.label}
                          </Typography>
                        </span>
                        <Typography
                          variant="caption"
                          className="text-[9px] font-medium uppercase bg-sidebar-accent/30 px-1 py-0.2 rounded text-muted-foreground/40"
                        >
                          Soon
                        </Typography>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href ?? "#"}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        item.active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                    >
                      <AppIcon
                        name={item.icon}
                        size={16}
                        className={
                          item.active
                            ? "text-sidebar-primary"
                            : "text-muted-foreground"
                        }
                      />
                      <Typography
                        variant="small"
                        className="text-xs text-inherit"
                      >
                        {item.label}
                      </Typography>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Identity & Logout Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary font-semibold text-xs uppercase">
              {userName ? userName.charAt(0) : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <Typography
                variant="small"
                className="text-xs font-medium text-sidebar-foreground truncate"
              >
                {userName}
              </Typography>
              <Typography
                variant="muted"
                className="text-[11px] text-muted-foreground truncate"
              >
                {userEmail}
              </Typography>
            </div>
          </div>
          <SignOutButton variant="icon" />
        </div>
      </div>
    </aside>
  );
}
