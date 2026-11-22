"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { InputText } from "@/components/ui/input-text";

import { BUILT_IN_ROLES, type Role } from "@/lib/auth/rbac";
import { MultiSelector } from "@/components/ui/MultiSelector";

interface CompanyMembersFiltersProps {
  search: string;
  roles: string[];
}

const ROLE_OPTIONS = BUILT_IN_ROLES.map((role) => ({
  label: role.charAt(0) + role.slice(1).toLowerCase(),
  value: role,
}));

export function CompanyMembersFilters({
  search,
  roles,
}: CompanyMembersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(search);

  const selectedRoles = useMemo(
    () => BUILT_IN_ROLES.filter((role) => roles.includes(role)),
    [roles],
  );

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

      params.set("page", "1");

      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchInput, searchParams]);

  function updateRoles(nextRoles: string[]) {
    const validRoles = new Set(
      nextRoles.filter((role): role is Role =>
        BUILT_IN_ROLES.includes(role as Role),
      ),
    );

    const orderedRoles = BUILT_IN_ROLES.filter((role) => validRoles.has(role));

    const params = new URLSearchParams(searchParams.toString());

    if (orderedRoles.length > 0) {
      params.set("roles", orderedRoles.join(","));
    } else {
      params.delete("roles");
    }

    params.set("page", "1");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    setSearchInput("");

    const params = new URLSearchParams(searchParams.toString());

    params.delete("search");
    params.delete("roles");
    params.delete("page");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const hasActiveFilters = Boolean(search || roles.length > 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <InputText
          label="Search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search members..."
          aria-label="Search members"
          className="w-full"
          containerClassName="w-80"
        />

        <div className="w-full md:w-60">
          <MultiSelector
            label="Roles"
            placeholder="All roles"
            value={selectedRoles}
            onValueChange={updateRoles}
            options={ROLE_OPTIONS}
          />
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="md:mb-0.5"
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
