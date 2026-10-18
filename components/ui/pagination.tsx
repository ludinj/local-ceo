"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
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

  const previousDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updatePage(page - 1)}
        disabled={previousDisabled}
      >
        Previous
      </Button>

      <Typography variant="small" className="text-sm font-medium text-muted-foreground">
        Page {page} of {totalPages}
      </Typography>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updatePage(page + 1)}
        disabled={nextDisabled}
      >
        Next
      </Button>
    </div>
  );
}
