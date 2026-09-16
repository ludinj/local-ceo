"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppIcon } from "@/components/ui/app-icon";
import { Tooltip } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  className?: string;
  variant?: "icon" | "full" | "subtle";
}

export function SignOutButton({
  className,
  variant = "subtle",
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      const supabase = createClient();

      await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
      setIsSigningOut(false);
    }
  };

  if (variant === "icon") {
    return (
      <Tooltip
        content={isSigningOut ? "Signing out..." : "Sign out"}
        side="top"
      >
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          aria-label="Sign out"
          className={`inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 ${
            className || ""
          }`}
        >
          <AppIcon name="log-out" size="sm" />
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 ${
        className || ""
      }`}
    >
      <span className="flex items-center gap-2">
        <AppIcon name="log-out" size="sm" />

        {isSigningOut ? "Signing out..." : "Sign Out"}
      </span>
    </button>
  );
}
