"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputText } from "@/components/ui/input-text";
import { BUILT_IN_ROLES, type Role } from "@/lib/auth/rbac";

interface CompanyMembersFiltersProps {
  search: string;
  roles: string[];
}

export function CompanyMembersFilters({ search, roles }: CompanyMembersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(search);
  const selectedRoles = useMemo(() => new Set(roles), [roles]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      const currentSearch = (searchParams.get("search") ?? "").trim();

      if (nextSearch === currentSearch) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (nextSearch) {
        params.set("search", nextSearch);
      } else {
        params.delete("search");
      }

      params.delete("page");
      params.set("page", "1");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchInput, searchParams]);

  function updateRoles(nextRole: Role) {
    const params = new URLSearchParams(searchParams.toString());
    const currentRoles = Array.from(
      new Set(
        (searchParams.get("roles") ?? "")
          .split(",")
          .map((role) => role.trim().toUpperCase())
          .filter(Boolean)
          .filter((role) => BUILT_IN_ROLES.includes(role as Role))
      )
    );

    const nextRoles = new Set(currentRoles);

    if (nextRoles.has(nextRole)) {
      nextRoles.delete(nextRole);
    } else {
      nextRoles.add(nextRole);
    }

    const orderedRoles = BUILT_IN_ROLES.filter((role) => nextRoles.has(role));

    if (orderedRoles.length > 0) {
      params.set("roles", orderedRoles.join(","));
    } else {
      params.delete("roles");
    }

    params.delete("page");
    params.set("page", "1");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("roles");
    params.delete("page");
    params.set("page", "1");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const hasActiveFilters = Boolean(search || roles.length > 0);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <InputText
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search members..."
            aria-label="Search members"
            className="w-full"
          />
        </div>

        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {BUILT_IN_ROLES.map((role) => {
          const isSelected = selectedRoles.has(role);

          return (
            <Button
              key={role}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => updateRoles(role)}
              className="rounded-full"
            >
              {role}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
