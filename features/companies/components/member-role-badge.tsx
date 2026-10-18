interface MemberRoleBadgeProps {
  role: string;
}

export function MemberRoleBadge({ role }: MemberRoleBadgeProps) {
  const toneClasses: Record<string, string> = {
    OWNER: "bg-primary/10 text-primary",
    ADMIN: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    MANAGER: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    FINANCE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    VIEWER: "bg-muted text-foreground",
  };

  const normalizedRole = role.toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        toneClasses[normalizedRole] ?? "bg-muted text-foreground"
      }`}
    >
      {normalizedRole}
    </span>
  );
}
