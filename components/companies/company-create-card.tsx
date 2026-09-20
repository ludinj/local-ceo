"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CompanyForm } from "@/components/companies/company-form";
import { Typography } from "@/components/ui/typography";

export function CompanyCreateCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex min-h-55 flex-col justify-between rounded-xl border border-dashed border-border bg-card p-5 text-left shadow-xs transition-all hover:border-primary/40 hover:bg-muted/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="size-5" strokeWidth={2.5} />
          </div>
        </div>

        <div className="space-y-2">
          <Typography variant="header-4">Create Company</Typography>
          <Typography variant="muted" className="text-sm">
            Add a new business workspace and start organizing your operations.
          </Typography>
        </div>

        <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span>New workspace</span>
          <span className="font-medium text-primary">Open</span>
        </div>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-4 shadow-2xl sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Typography variant="header-2">Create a company</Typography>
                <Typography variant="muted">
                  Add the business details that will drive your Local CEO
                  workspace.
                </Typography>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close create company dialog"
              >
                <Plus className="size-4 rotate-45" strokeWidth={2.5} />
              </button>
            </div>

            <CompanyForm
              onSuccess={() => setIsOpen(false)}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
