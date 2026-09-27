export interface CompanyListQuery {
  page: number;
  search: string;
  industry: string;
}

export interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  countryCode: string;
  createdAt: Date;
  role: string;
}

export interface CompanyPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CompanyListResult {
  items: CompanyListItem[];
  pagination: CompanyPagination;
}
