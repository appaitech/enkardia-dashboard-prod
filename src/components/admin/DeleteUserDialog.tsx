
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  account_type: string;
  role: string;
  created_at: string;
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  onUserDeleted: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onUserDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { session, user: currentUser } = useAuth();

  // Check if the user is a CONSOLE ADMIN user trying to delete another CONSOLE ADMIN
  const isConsoleTryingToDeleteAdmin = 
    user.account_type === "CONSOLE" && 
    user.role === "ADMIN" && 
    currentUser?.accountType === "CONSOLE" && 
    currentUser?.role === "ADMIN";

  const handleDelete = async () => {
    if (isDeleting) return; // Prevent multiple clicks
    
    // Prevent CONSOLE ADMINs from deleting other CONSOLE ADMINs
    if (isConsoleTryingToDeleteAdmin) {
      toast.error("You cannot delete other admin console users");
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log("Attempting to delete user with ID:", user.id);
      
      // Call the edge function using Supabase's functions.invoke method
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user.id },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      console.log("Delete user response:", data);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete user');
      }

      toast.success(`User ${user.name || user.email} deleted successfully`);
      onUserDeleted();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-100 rounded-md p-4 my-4">
          <p className="font-medium">Are you sure you want to delete the following user?</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><span className="font-medium">Name:</span> {user.name || "Not specified"}</li>
            <li><span className="font-medium">Email:</span> {user.email}</li>
            <li><span className="font-medium">Role:</span> {user.role}</li>
            <li><span className="font-medium">Account Type:</span> {user.account_type}</li>
          </ul>
          
          {isConsoleTryingToDeleteAdmin && (
            <div className="mt-3 text-red-600 text-sm">
              You cannot delete another admin console user.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting || isConsoleTryingToDeleteAdmin}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
