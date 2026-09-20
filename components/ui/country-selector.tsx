"use client";

import { useMemo, useState } from "react";
import { allCountries } from "country-region-data";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type CountryOption = {
  label: string;
  value: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = allCountries
  .map(([countryName, countryShortCode]) => ({
    label: countryName,
    value: countryShortCode,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

interface CountrySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

export function CountrySelector({
  value,
  onValueChange,
  placeholder = "Select a country",
  disabled = false,
  className,
  "aria-invalid": ariaInvalid = false,
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((country) => country.value === value) ?? null,
    [value]
  );

  const filteredCountries = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return COUNTRY_OPTIONS;
    }

    return COUNTRY_OPTIONS.filter((country) => {
      return (
        country.label.toLowerCase().includes(normalized) ||
        country.value.toLowerCase().includes(normalized)
      );
    });
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-left font-normal",
              !selectedCountry && "text-muted-foreground",
              ariaInvalid &&
                "border-destructive focus-visible:ring-destructive/20",
              className
            )}
          >
            <span className="truncate">
              {selectedCountry ? selectedCountry.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search countries..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onValueChange(country.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === country.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{country.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
