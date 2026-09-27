"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InputText } from "@/components/ui/input-text";
import { Selector } from "@/components/ui/selector";

interface CompanyFiltersProps {
  industries: string[];
}

export function CompanyFilters({ industries }: CompanyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? "";
      const nextSearch = searchInput.trim();

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
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchInput, searchParams]);

  function handleIndustryChange(nextIndustry: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextIndustry && nextIndustry !== "all") {
      params.set("industry", nextIndustry);
    } else {
      params.delete("industry");
    }

    params.delete("page");
    params.set("page", "1");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const selectedIndustry = searchParams.get("industry") ?? "all";

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="w-80 max-w-full">
        <InputText
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search companies..."
          aria-label="Search companies"
          className="w-full"
        />
      </div>

      <div className="w-full md:w-56">
        <Selector
          value={selectedIndustry}
          onValueChange={handleIndustryChange}
          options={[
            { label: "All industries", value: "all" },
            ...industries.map((industry) => ({
              label: industry,
              value: industry,
            })),
          ]}
          placeholder="All industries"
          aria-invalid={false}
        />
      </div>
    </div>
  );
}
