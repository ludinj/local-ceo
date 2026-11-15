"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputText } from "@/components/ui/input-text";
import { SimpleSelector } from "@/components/ui/simple-selector";
import { useToast } from "@/components/ui/toaster";
import { Typography } from "@/components/ui/typography";
import { createInvitationAction } from "@/lib/actions/invitations";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  FINANCE: "Finance",
  VIEWER: "Viewer",
};

type InviteMemberFormValues = {
  email: string;
  role: string;
};

interface InviteMemberDialogProps {
  companySlug: string;
  allowedRoles: string[];
}

export function InviteMemberDialog({
  companySlug,
  allowedRoles,
}: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, "Email address is required.")
          .max(254, "Email address is too long.")
          .email("Please enter a valid email address.")
          .transform((value) => value.toLowerCase()),
        role: z
          .string()
          .trim()
          .min(1, "Please select a role.")
          .refine((value) => allowedRoles.includes(value), {
            message: "Please select a valid role.",
          }),
      }),
    [allowedRoles],
  );

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      role: "",
    },
    mode: "onSubmit",
  });

  const roleOptions = allowedRoles.map((role) => ({
    label: ROLE_LABELS[role] ?? role,
    value: role,
  }));

  const resetForm = () => {
    form.reset({
      email: "",
      role: "",
    });
    form.clearErrors();
  };

  const closeDialog = () => {
    if (form.formState.isSubmitting) {
      return;
    }

    setIsOpen(false);
    resetForm();
  };

  async function onSubmit(data: InviteMemberFormValues) {
    try {
      const result = await createInvitationAction({
        companySlug,
        email: data.email,
        role: data.role,
      });

      if (!result.success) {
        form.setError("root", {
          type: "server",
          message: result.error,
        });
        return;
      }

      form.reset({
        email: "",
        role: "",
      });
      form.clearErrors();
      setIsOpen(false);
      toast.success("Invitation created successfully.");
    } catch {
      form.setError("root", {
        type: "server",
        message: "Unable to create the invitation.",
      });
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2"
      >
        <AppIcon name="members" size="sm" aria-hidden={true} />
        Invite Member
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(nextOpen) => {
          if (form.formState.isSubmitting && !nextOpen) {
            return;
          }

          setIsOpen(nextOpen);

          if (!nextOpen) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <AppIcon name="members" size="sm" aria-hidden={true} />
              </div>
              <DialogTitle className="text-lg font-semibold">
                Invite a member
              </DialogTitle>
            </div>
            <Typography variant="muted" className="text-sm">
              Invite someone to collaborate in this company.
            </Typography>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <InputText
              label="Email address"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />

            <div className="space-y-2">
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <SimpleSelector
                    label="Role"
                    placeholder="Select a role"
                    required
                    value={field.value ?? ""}
                    onValueChange={(value) => field.onChange(value)}
                    options={roleOptions}
                    error={form.formState.errors.role?.message}
                  />
                )}
              />
            </div>

            {form.formState.errors.root?.message ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <Typography
                  variant="small"
                  className="text-sm text-destructive"
                >
                  {form.formState.errors.root.message}
                </Typography>
              </div>
            ) : null}

            <Typography variant="muted" className="text-xs leading-relaxed">
              The invited person can accept the invitation after signing in or
              creating a Local CEO account with this email address.
            </Typography>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
