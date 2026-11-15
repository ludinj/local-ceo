import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type InputTextProps = React.ComponentPropsWithoutRef<"input"> & {
  label?: string;
  error?: string;
  helperText?: string;
  labelClassName?: string;
  containerClassName?: string;
};

const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
  function InputText(
    {
      label,
      error,
      helperText,
      id,
      required,
      className,
      labelClassName,
      containerClassName,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy =
      [ariaDescribedBy, error ? errorId : helperText ? helperId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
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
        )}

        <Input
          {...props}
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive/30",
            className,
          )}
        />

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
  },
);

InputText.displayName = "InputText";

export { InputText };
