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

export interface GetUserCompaniesInput extends CompanyListQuery {
  userId: string;
}

export interface GetCompanyMembersParams {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
  roles?: string[];
}

export interface CompanyMemberItem {
  id: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CompanyMembersResult {
  items: CompanyMemberItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
