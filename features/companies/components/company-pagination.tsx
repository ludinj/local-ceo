"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { CompanyPagination } from "@/features/companies/interfaces";

interface CompanyPaginationProps {
  pagination: CompanyPagination;
}

export function CompanyPagination({ pagination }: CompanyPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  console.log(pagination.totalPages, "(pagination.totalPages ");
  if (pagination.totalPages <= 1) {
    return null;
  }

  function updatePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const previousDisabled = !pagination.hasPreviousPage;
  const nextDisabled = !pagination.hasNextPage;

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updatePage(pagination.page - 1)}
        disabled={previousDisabled}
      >
        Previous
      </Button>

      <span className="text-sm font-medium text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updatePage(pagination.page + 1)}
        disabled={nextDisabled}
      >
        Next
      </Button>
    </div>
  );
}
