"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { MultiSelector } from "@/components/ui/MultiSelector";
import { INVITABLE_ROLES } from "@/lib/invitations/policy";
import type { InvitationStatus } from "@/lib/generated/prisma/client";

interface CompanyInvitationsFiltersProps {
  statuses: InvitationStatus[];
  roles: string[];
}

const STATUS_OPTIONS: {
  label: string;
  value: InvitationStatus;
}[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Revoked", value: "REVOKED" },
];

const ROLE_OPTIONS = INVITABLE_ROLES.map((role) => ({
  label: role.charAt(0) + role.slice(1).toLowerCase(),
  value: role,
}));

export function CompanyInvitationsFilters({
  statuses,
  roles,
}: CompanyInvitationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function updateStatuses(nextStatuses: string[]) {
    const selected = new Set(nextStatuses);

    const orderedStatuses = STATUS_OPTIONS.map((option) => option.value).filter(
      (status) => selected.has(status),
    );

    const isDefault =
      orderedStatuses.length === 1 && orderedStatuses[0] === "PENDING";

    updateParams({
      status: isDefault
        ? null
        : orderedStatuses.length === 0
          ? "ALL"
          : orderedStatuses.join(","),
    });
  }

  function updateRoles(nextRoles: string[]) {
    const selected = new Set(nextRoles);

    const orderedRoles = INVITABLE_ROLES.filter((role) => selected.has(role));

    updateParams({
      inviteRoles: orderedRoles.length > 0 ? orderedRoles.join(",") : null,
    });
  }

  function clearFilters() {
    updateParams({
      status: null,
      inviteRoles: null,
    });
  }

  const hasActiveFilters =
    statuses.length !== 1 || statuses[0] !== "PENDING" || roles.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="w-full md:w-60">
          <MultiSelector
            label="Status"
            placeholder="All statuses"
            value={statuses}
            onValueChange={updateStatuses}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="w-full md:w-60">
          <MultiSelector
            label="Roles"
            placeholder="All roles"
            value={roles}
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
