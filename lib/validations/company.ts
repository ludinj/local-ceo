import { z } from "zod";

const optionalTrimmedString = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value));

export const companyCreateInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Company name is required.")
    .max(160, "Company name is too long."),
  legalName: optionalTrimmedString(160, "Legal name is too long."),
  countryCode: z
    .string()
    .trim()
    .min(1, "Country is required.")
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]{2}$/.test(value), "Country is required."),
  registrationNumber: optionalTrimmedString(
    80,
    "Registration / Tax ID is too long.",
  ),
  industry: optionalTrimmedString(80, "Industry is too long."),
});

export type CompanyCreateInput = {
  name: string;
  legalName?: string;
  countryCode: string;
  registrationNumber?: string;
  industry?: string;
};

export type CompanyCreatePayload = z.output<typeof companyCreateInputSchema>;

export type CompanyCreateFormErrors = Partial<
  Record<keyof CompanyCreateInput, string>
>;
