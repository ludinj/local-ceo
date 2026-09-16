import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

interface AppSidebarProps {
  userEmail?: string;
  userName?: string;
}

export function AppSidebar({ userEmail, userName }: AppSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col justify-between hidden md:flex min-h-screen">
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
            <svg
              className="size-4 text-sidebar-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Home
          </Link>

          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
            <span className="flex items-center gap-3">
              <svg
                className="size-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
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
