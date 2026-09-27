import Link from "next/link";
import { Typography } from "@/components/ui/typography";

interface CompanyCardProps {
  name: string;
  slug: string;
  industry: string;
  role: string;
}

export function CompanyCard({ name, slug, industry, role }: CompanyCardProps) {
  const initial = name.charAt(0);

  return (
    <Link
      href={`/companies/${slug}`}
      className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-base group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {initial}
            </div>
            <div>
              <Typography
                variant="header-4"
                className="leading-tight group-hover:text-primary transition-colors"
              >
                {name}
              </Typography>
              <Typography variant="muted" className="text-xs mt-0.5">
                {industry}
              </Typography>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {role}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
        <Typography variant="caption" className="normal-case text-[11px]">
          Workspace
        </Typography>
        <span className="font-medium text-primary flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform">
          Open Workspace &rarr;
        </span>
      </div>
    </Link>
  );
}
