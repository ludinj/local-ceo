"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastOptions {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 shadow-emerald-500/10 dark:text-emerald-100",
  error:
    "border-destructive/40 bg-destructive/10 text-destructive shadow-destructive/10",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-amber-950 shadow-amber-500/10 dark:text-amber-100",
  info: "border-primary/20 bg-card text-foreground shadow-primary/10",
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const variant = toast.variant ?? "info";
  const label =
    toast.title ?? variant.charAt(0).toUpperCase() + variant.slice(1);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 shadow-sm backdrop-blur-sm",
        variantStyles[variant],
      )}
    >
      <div className="min-w-0 flex-1">
        {toast.title ? (
          <p className="text-sm font-semibold leading-5">{toast.title}</p>
        ) : null}
        <p className={cn("text-sm leading-5", toast.title ? "mt-1" : "")}>
          {toast.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label={`Dismiss ${label} notification`}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-current/70 transition hover:bg-black/5 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = 4000,
    }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [
        ...current,
        { id, title, description, variant, duration },
      ]);

      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss],
  );

  const contextValue = React.useMemo<ToastContextValue>(
    () => ({ toast, dismiss }),
    [dismiss, toast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      >
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-2">
          {toasts.map((toastItem) => (
            <ToastCard
              key={toastItem.id}
              toast={toastItem}
              onDismiss={() => dismiss(toastItem.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toast: {
      success: (
        description: string,
        options: Omit<ToastOptions, "description" | "variant"> = {},
      ) => context.toast({ ...options, description, variant: "success" }),
      error: (
        description: string,
        options: Omit<ToastOptions, "description" | "variant"> = {},
      ) => context.toast({ ...options, description, variant: "error" }),
      warning: (
        description: string,
        options: Omit<ToastOptions, "description" | "variant"> = {},
      ) => context.toast({ ...options, description, variant: "warning" }),
      info: (
        description: string,
        options: Omit<ToastOptions, "description" | "variant"> = {},
      ) => context.toast({ ...options, description, variant: "info" }),
    },
    dismiss: context.dismiss,
  };
}
