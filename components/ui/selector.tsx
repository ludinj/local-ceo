"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectorOption = {
  label: string;
  value: string;
};

interface SelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectorOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

export function Selector({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
  "aria-invalid": ariaInvalid = false,
}: SelectorProps) {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      disabled={disabled}
    >
      <SelectTrigger
        aria-invalid={ariaInvalid}
        className={cn(
          "w-full justify-between",
          ariaInvalid && "border-destructive focus-visible:ring-destructive/20",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="p-2" align="start" alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
