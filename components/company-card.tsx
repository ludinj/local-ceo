import { Typography } from "@/components/ui/typography";

interface CompanyCardProps {
  name: string;
  industry: string;
  role: string;
}

export function CompanyCard({ name, industry, role }: CompanyCardProps) {
  const initial = name.charAt(0);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-base">
              {initial}
            </div>
            <div>
              <Typography variant="header-4" className="leading-tight">
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
          Preview Card
        </Typography>
        <span className="font-medium text-primary/70 opacity-60 cursor-not-allowed text-xs">
          Open &rarr;
        </span>
      </div>
    </div>
  );
}
