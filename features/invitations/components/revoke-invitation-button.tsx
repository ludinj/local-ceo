"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toaster";
import { revokeInvitationAction } from "@/lib/actions/invitations";

interface RevokeInvitationButtonProps {
  companySlug: string;
  invitationId: string;
  email: string;
}

export function RevokeInvitationButton({
  companySlug,
  invitationId,
  email,
}: RevokeInvitationButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  async function handleRevoke() {
    if (isRevoking) return;

    setIsRevoking(true);

    try {
      const result = await revokeInvitationAction({
        companySlug,
        invitationId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setIsOpen(false);
      toast.success("Invitation revoked successfully.");
      router.refresh();
    } catch {
      toast.error("Unable to revoke the invitation.");
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isRevoking}
        onClick={() => setIsOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        Revoke
      </Button>

      <ConfirmationDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Revoke invitation"
        description={`Are you sure you want to revoke the invitation for ${email}? This action cannot be undone.`}
        confirmLabel="Revoke"
        destructive
        isLoading={isRevoking}
        onConfirm={handleRevoke}
      />
    </>
  );
}
