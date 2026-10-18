import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { AppIcon } from "./ui/app-icon";

interface AppSidebarProps {
  userEmail?: string;
  userName?: string;
}

export function AppSidebar({ userEmail, userName }: AppSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground  flex-col justify-between hidden md:flex min-h-screen">
      <div className="p-6 space-y-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            LC
          </div>
          <span className="font-semibold text-lg tracking-tight text-sidebar-foreground">
            Local CEO
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <Link
            href="/home"
            className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground transition-colors"
          >
            <AppIcon name="home" size="sm" className="text-sidebar-primary" />
            Home
          </Link>

          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/80 cursor-not-allowed">
            <span className="flex items-center gap-3">
              <AppIcon name="building" size="sm" />
              Companies
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase bg-sidebar-accent/50 px-1.5 py-0.5 rounded text-muted-foreground/50">
              Phase 3
            </span>
          </div>
        </nav>
      </div>

      {/* User Identity & Sign Out Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary font-semibold text-xs uppercase">
              {userName ? userName.charAt(0) : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-sidebar-foreground truncate">
                {userName}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>
          <SignOutButton variant="icon" />
        </div>
      </div>
    </aside>
  );
}
