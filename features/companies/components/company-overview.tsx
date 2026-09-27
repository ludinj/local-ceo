import { Typography } from "@/components/ui/typography";
import { AppIcon } from "@/components/ui/app-icon";
import type { CompanyContext } from "@/lib/auth/company-context";

interface CompanyOverviewProps {
  context: CompanyContext;
}

export function CompanyOverview({ context }: CompanyOverviewProps) {
  const { company, membership } = context;

  const isVenezuela = company.countryCode === "VE";
  const taxIdLabel = isVenezuela ? "RIF" : "Registration / Tax ID";

  const formattedCreatedDate = new Date(company.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const formattedMemberSinceDate = new Date(
    membership.createdAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-xs">
            {company.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="header-2">{company.name}</Typography>
              <Typography
                variant="caption"
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase tracking-wide"
              >
                {membership.role}
              </Typography>
            </div>
            <Typography variant="muted" className="text-xs">
              {company.legalName || company.name} &bull; {company.industry || "General Industry"}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs">
            <AppIcon name="building" size={14} className="text-muted-foreground" />
            <Typography variant="small" className="text-xs">
              Country: <strong className="font-semibold">{company.countryCode}</strong>
            </Typography>
          </div>
        </div>
      </div>

      {/* Real Model Data Quick Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-1 shadow-xs">
          <Typography variant="caption" className="text-muted-foreground">
            Current Membership Role
          </Typography>
          <Typography variant="header-3" className="capitalize text-primary">
            {membership.role}
          </Typography>
          <Typography variant="muted" className="text-[11px]">
            Joined {formattedMemberSinceDate}
          </Typography>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-1 shadow-xs">
          <Typography variant="caption" className="text-muted-foreground">
            {taxIdLabel}
          </Typography>
          <Typography variant="header-3" className="font-mono text-base">
            {company.registrationNumber || "Not registered"}
          </Typography>
          <Typography variant="muted" className="text-[11px]">
            Generic Tax Identifier
          </Typography>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-1 shadow-xs">
          <Typography variant="caption" className="text-muted-foreground">
            Primary Jurisdiction
          </Typography>
          <Typography variant="header-3">
            {company.countryCode}
          </Typography>
          <Typography variant="muted" className="text-[11px]">
            ISO Country Code
          </Typography>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-1 shadow-xs">
          <Typography variant="caption" className="text-muted-foreground">
            Tenant Status
          </Typography>
          <Typography variant="header-3" className="text-emerald-600 dark:text-emerald-400">
            Active
          </Typography>
          <Typography variant="muted" className="text-[11px]">
            Isolated PostgreSQL Tenant
          </Typography>
        </div>
      </div>

      {/* Detailed Entity Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-5 shadow-xs">
          <div>
            <Typography variant="header-3">Company Details</Typography>
            <Typography variant="muted" className="text-xs">
              Registered profile and membership details stored in PostgreSQL
            </Typography>
          </div>

          <div className="divide-y divide-border/60 text-sm">
            <div className="flex justify-between py-3">
              <Typography variant="muted" className="text-sm">Display Name</Typography>
              <Typography variant="small" className="text-sm font-medium">{company.name}</Typography>
            </div>
            <div className="flex justify-between py-3">
              <Typography variant="muted" className="text-sm">Legal Entity Name</Typography>
              <Typography variant="small" className="text-sm font-medium">
                {company.legalName || "Not provided"}
              </Typography>
            </div>
            <div className="flex justify-between py-3">
              <Typography variant="muted" className="text-sm">Workspace Slug</Typography>
              <Typography variant="code" className="text-xs bg-muted px-2 py-0.5 rounded">
                {company.slug}
              </Typography>
            </div>
            <div className="flex justify-between py-3">
              <Typography variant="muted" className="text-sm">Industry</Typography>
              <Typography variant="small" className="text-sm font-medium">
                {company.industry || "Not specified"}
              </Typography>
            </div>
            <div className="flex justify-between py-3">
              <Typography variant="muted" className="text-sm">{taxIdLabel}</Typography>
              <Typography variant="small" className="text-sm font-medium">
                {company.registrationNumber || "Not provided"}
              </Typography>
            </div>
            <div className="flex justify-between py-3">
              <Typography variant="muted" className="text-sm">Created On</Typography>
              <Typography variant="small" className="text-sm font-medium">
                {formattedCreatedDate}
              </Typography>
            </div>
          </div>
        </div>

        {/* Phase Roadmap / Architecture Card */}
        <div className="rounded-xl border border-border bg-sidebar p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AppIcon name="briefcase" size={18} className="text-primary" />
              <Typography variant="header-4">Workspace Active</Typography>
            </div>
            <Typography variant="muted" className="text-xs leading-relaxed">
              You are currently viewing the isolated company workspace for{" "}
              <strong className="font-semibold text-foreground">{company.name}</strong>. All requests in this area are verified against your server-side membership record.
            </Typography>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-xs">
            <Typography variant="small" className="font-semibold text-foreground block text-xs">
              Upcoming Modules (Phase 4+)
            </Typography>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside text-[11px]">
              <li>
                <Typography variant="small" as="span" className="text-[11px] text-inherit font-normal">
                  Phase 4: Granular RBAC Permissions
                </Typography>
              </li>
              <li>
                <Typography variant="small" as="span" className="text-[11px] text-inherit font-normal">
                  Phase 5: Member Invitations
                </Typography>
              </li>
              <li>
                <Typography variant="small" as="span" className="text-[11px] text-inherit font-normal">
                  Phase 6+: Business Modules & AI Agents
                </Typography>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
