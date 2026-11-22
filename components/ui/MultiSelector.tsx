"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { SelectOption } from "@/components/ui/simple-selector";
import { cn } from "@/lib/utils";

export interface MultiSelectorProps {
  label?: string;
  placeholder?: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  options: SelectOption[];
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  id?: string;
  emptyLabel?: string;
}

export function MultiSelector({
  label,
  placeholder = "Select options",
  value,
  onValueChange,
  options,
  disabled = false,
  error,
  helperText,
  className,
  containerClassName,
  labelClassName,
  id,
  emptyLabel = "No options available.",
}: MultiSelectorProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const [isOpen, setIsOpen] = React.useState(false);

  const selectedValues = React.useMemo(() => new Set(value), [value]);

  const selectedOptions = React.useMemo(
    () => options.filter((option) => selectedValues.has(option.value)),
    [options, selectedValues],
  );

  function toggleOption(optionValue: string) {
    if (disabled) return;

    const option = options.find((item) => item.value === optionValue);

    if (!option || option.disabled) return;

    if (selectedValues.has(optionValue)) {
      onValueChange(value.filter((item) => item !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  }

  const displayValue =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length <= 2
        ? selectedOptions.map((option) => option.label).join(", ")
        : `${selectedOptions.length} selected`;

  const describedBy =
    [error ? errorId : helperText ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label ? (
        <Typography
          as="label"
          variant="small"
          className={cn("mb-1.5 block text-sm font-medium", labelClassName)}
        >
          {label}
        </Typography>
      ) : null}

      <Popover.Root open={isOpen && !disabled} onOpenChange={setIsOpen}>
        <Popover.Trigger
          render={
            <Button
              id={selectId}
              type="button"
              variant="outline"
              size="lg"
              disabled={disabled}
              aria-describedby={describedBy}
              aria-invalid={Boolean(error) || undefined}
              aria-label={label ? undefined : placeholder}
              className={cn(
                "h-auto min-h-9 w-full justify-between gap-2 px-3 py-2",
                "text-left font-normal",
                error && "border-destructive",
                className,
              )}
            />
          }
        >
          <Typography
            as="span"
            variant="small"
            className={cn(
              "min-w-0 flex-1 truncate text-left font-normal",
              selectedOptions.length === 0 && "text-muted-foreground",
            )}
          >
            {displayValue}
          </Typography>
          <AppIcon
            name="chevron-down"
            size="sm"
            aria-hidden={true}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform",
              isOpen && !disabled && "rotate-180",
            )}
          />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner
            side="bottom"
            align="start"
            sideOffset={4}
            className="z-50"
          >
            <Popover.Popup
              aria-label={label ? `${label} options` : "Select options"}
              className={cn(
                "w-(--anchor-width) min-w-48",
                "overflow-hidden rounded-md border border-border",
                "bg-popover p-1 text-popover-foreground shadow-md",
                "outline-none",
              )}
            >
              <div className="max-h-60 space-y-0.5 overflow-y-auto">
                {options.length === 0 ? (
                  <Typography
                    variant="muted"
                    className="px-3 py-4 text-center text-sm"
                  >
                    {emptyLabel}
                  </Typography>
                ) : (
                  options.map((option) => {
                    const isSelected = selectedValues.has(option.value);

                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3",
                          "rounded-sm px-3 py-2 text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-within:bg-accent",
                          option.disabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={option.disabled}
                          onChange={() => toggleOption(option.value)}
                          className="size-4 shrink-0 accent-primary"
                        />

                        <Typography
                          as="span"
                          variant="small"
                          className="min-w-0 flex-1 truncate font-normal"
                        >
                          {option.label}
                        </Typography>
                      </label>
                    );
                  })
                )}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      {error ? (
        <Typography
          as="p"
          id={errorId}
          variant="muted"
          role="alert"
          className="mt-1.5 text-xs text-destructive"
        >
          {error}
        </Typography>
      ) : helperText ? (
        <Typography
          as="p"
          id={helperId}
          variant="muted"
          className="mt-1.5 text-xs"
        >
          {helperText}
        </Typography>
      ) : null}
    </div>
  );
}
