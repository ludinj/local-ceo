"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { createCompanyAction } from "@/lib/actions/company";
import {
  companyCreateInputSchema,
  type CompanyCreateInput,
} from "@/lib/validations/company";
import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/ui/country-selector";
import { InputText } from "@/components/ui/input-text";
import { Selector } from "@/components/ui/selector";

const INDUSTRY_OPTIONS = [
  "Technology",
  "Retail",
  "Professional Services",
  "Food & Beverage",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Manufacturing",
  "Education",
  "Hospitality",
  "Other",
] as const;

interface CompanyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CompanyForm({ onSuccess, onCancel }: CompanyFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompanyCreateInput>({
    resolver: zodResolver(companyCreateInputSchema),
    defaultValues: {
      name: "",
      legalName: "",
      countryCode: "",
      registrationNumber: "",
      industry: "",
    },
  });

  const selectedCountryCode = useWatch({ control, name: "countryCode" }) ?? "";
  const watchIndustryValue = useWatch({ control, name: "industry" }) ?? "";
  const registrationFieldLabel =
    selectedCountryCode === "VE" ? "RIF" : "Registration / Tax ID";

  async function onSubmit(data: CompanyCreateInput) {
    setServerError(null);

    const result = await createCompanyAction(data);

    if (!result.ok) {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([key, message]) => {
          setError(key as keyof CompanyCreateInput, {
            type: "server",
            message,
          });
        });
      }

      if (result.message) {
        setServerError(result.message);
      }

      return;
    }

    if (onSuccess) {
      router.refresh();
      onSuccess();
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {serverError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Company name <span className="text-destructive">*</span>
        </label>
        <InputText
          id="name"
          type="text"
          autoComplete="organization"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="legalName"
          className="text-sm font-medium text-foreground"
        >
          Legal name
        </label>
        <InputText
          id="legalName"
          type="text"
          autoComplete="organization"
          aria-invalid={Boolean(errors.legalName)}
          {...register("legalName")}
        />
        {errors.legalName ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.legalName.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Country <span className="text-destructive">*</span>
          </label>
          <Controller
            name="countryCode"
            control={control}
            render={({ field }) => (
              <CountrySelector
                value={field.value ?? ""}
                onValueChange={(countryCode) => field.onChange(countryCode)}
                placeholder="Select a country"
                aria-invalid={Boolean(errors.countryCode)}
              />
            )}
          />
          {errors.countryCode ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.countryCode.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="industry"
            className="text-sm font-medium text-foreground"
          >
            Industry
          </label>
          <Selector
            value={watchIndustryValue}
            onValueChange={(value) => setValue("industry", value)}
            options={INDUSTRY_OPTIONS.map((industry) => ({
              label: industry,
              value: industry,
            }))}
            placeholder="Select an industry"
            aria-invalid={Boolean(errors.industry)}
          />
          {errors.industry ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.industry.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="registrationNumber"
          className="text-sm font-medium text-foreground"
        >
          {registrationFieldLabel}
        </label>
        <InputText
          id="registrationNumber"
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(errors.registrationNumber)}
          placeholder={
            selectedCountryCode === "VE"
              ? "J-12345678-9"
              : "Optional registration or tax ID"
          }
          {...register("registrationNumber")}
        />
        {errors.registrationNumber ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.registrationNumber.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? "Creating company..." : "Create company"}
        </Button>
      </div>
    </form>
  );
}
