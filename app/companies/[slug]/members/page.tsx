import { getCompanyContext } from "@/lib/auth/company-context";
import { BUILT_IN_ROLES, requirePermission } from "@/lib/auth/rbac";
import { CompanyMembersPageContent } from "@/features/companies/components/company-members";

interface CompanyMembersPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    roles?: string | string[];
  }>;
}

function parsePageValue(rawValue: string | string[] | undefined): number {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue ?? "1";
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function parseSearchValue(rawValue: string | string[] | undefined): string {
  const value = Array.isArray(rawValue) ? rawValue.join(" ") : rawValue ?? "";
  return value.trim();
}

function parseRoleValues(rawValue: string | string[] | undefined): string[] {
  const rawRoles = Array.isArray(rawValue)
    ? rawValue.flatMap((value) => value.split(","))
    : (rawValue ?? "").split(",");

  return Array.from(
    new Set(
      rawRoles
        .map((role) => role.trim().toUpperCase())
        .filter((role) => Boolean(role))
        .filter((role) => BUILT_IN_ROLES.includes(role as (typeof BUILT_IN_ROLES)[number]))
    )
  );
}

export default async function CompanyMembersPage({
  params,
  searchParams,
}: CompanyMembersPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams;

  const context = await getCompanyContext(slug);
  requirePermission(context, "members.read");

  const page = parsePageValue(resolvedParams.page);
  const search = parseSearchValue(resolvedParams.search);
  const roles = parseRoleValues(resolvedParams.roles);

  return (
    <CompanyMembersPageContent
      companyName={context.company.name}
      companyId={context.company.id}
      page={page}
      search={search}
      roles={roles}
    />
  );
}
