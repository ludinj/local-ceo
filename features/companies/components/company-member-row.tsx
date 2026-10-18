import { Typography } from "@/components/ui/typography";
import type { CompanyMemberItem } from "@/features/companies/interfaces";
import { MemberRoleBadge } from "@/features/companies/components/member-role-badge";

interface CompanyMemberRowProps {
  member: CompanyMemberItem;
}

export function CompanyMemberRow({ member }: CompanyMemberRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 border-b border-border px-4 py-4 last:border-b-0">
      <div className="min-w-0">
        <Typography
          variant="small"
          className="truncate text-sm font-medium text-foreground"
        >
          {member.user.name ?? "Unnamed member"}
        </Typography>
        <Typography variant="muted" className="truncate text-xs">
          {member.user.email}
        </Typography>
      </div>

      <div>
        <MemberRoleBadge role={member.role} />
      </div>

      <div>
        <Typography variant="muted" className="text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(member.createdAt))}
        </Typography>
      </div>
    </div>
  );
}
