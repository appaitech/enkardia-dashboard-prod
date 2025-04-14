
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InviteUserForm from "@/components/InviteUserForm";

interface InviteClientUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  clientName?: string;
  onUserInvited?: () => void;
}

export default function InviteClientUserDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  onUserInvited,
}: InviteClientUserDialogProps) {
  const handleSuccess = () => {
    if (onUserInvited) {
      onUserInvited();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            {clientId 
              ? `Invite a user to join ${clientName || "this client business"}`
              : "Select a client business and invite a user"}
          </DialogDescription>
        </DialogHeader>
        
        <InviteUserForm
          clientId={clientId}
          clientName={clientName}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
          showClientSelect={!clientId}
        />
      </DialogContent>
    </Dialog>
  );
}
