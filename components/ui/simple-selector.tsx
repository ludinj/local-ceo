"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

interface SimpleSelectorProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  id?: string;
  "aria-describedby"?: string;
}

export function SimpleSelector({
  label,
  placeholder = "Select an option",
  required = false,
  value,
  onValueChange,
  options,
  disabled = false,
  error,
  helperText,
  className,
  labelClassName,
  containerClassName,
  id,
  "aria-describedby": ariaDescribedBy,
}: SimpleSelectorProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const describedBy =
    [ariaDescribedBy, error ? errorId : helperText ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label ? (
        <label
          htmlFor={selectId}
          className={cn(
            "mb-1.5 block text-sm font-medium text-foreground",
            labelClassName,
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
      ) : null}

      <Select
        value={value ?? undefined}
        onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
        disabled={disabled}
      >
        <SelectTrigger
          id={selectId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full justify-between",
            error && "border-destructive focus-visible:ring-destructive/20",
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="p-2"
          align="start"
          alignItemWithTrigger={false}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-destructive"
        >
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1.5 text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
