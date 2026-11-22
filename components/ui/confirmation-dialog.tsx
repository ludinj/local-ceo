"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  destructive?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  destructive = false,
}: ConfirmationDialogProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (isLoading && !nextOpen) return;

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={
                destructive
                  ? "flex size-9 items-center justify-center rounded-md bg-destructive/10 text-destructive"
                  : "flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"
              }
            >
              <AppIcon
                name={destructive ? "alert-triangle" : "info"}
                size="sm"
                aria-hidden={true}
              />
            </div>

            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>

          <Typography variant="muted" className="text-sm">
            {description}
          </Typography>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
