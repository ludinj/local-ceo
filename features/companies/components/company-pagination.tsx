import { Pagination } from "@/components/ui/pagination";
import type { CompanyPagination } from "@/features/companies/interfaces";

interface CompanyPaginationProps {
  pagination: CompanyPagination;
}

export function CompanyPagination({ pagination }: CompanyPaginationProps) {
  return <Pagination page={pagination.page} totalPages={pagination.totalPages} />;
}
