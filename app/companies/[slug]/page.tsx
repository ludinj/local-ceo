import { getCompanyContext } from "@/lib/auth/company-context";
import { CompanyOverview } from "@/features/companies/components/company-overview";

interface CompanyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const context = await getCompanyContext(slug);

  return <CompanyOverview context={context} />;
}
