import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Shield, Monitor, Smartphone, Pencil, Save, X, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.enum(["ADMIN", "STANDARD"], {
    required_error: "Please select a role",
  }),
  account_type: z.enum(["CONSOLE", "CLIENT"], {
    required_error: "Please select an account type",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  account_type: string;
  role: string;
  created_at: string;
}

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  onUserEdited: () => void;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onDeleteClick: () => void;
}

const ViewUserDialog: React.FC<ViewUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onUserEdited,
  isAdmin,
  canEdit,
  canDelete,
  onDeleteClick,
}) => {
  const { user: currentUser, updateUserProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isCurrentUserConsole = currentUser?.accountType === "CONSOLE";
  const isCurrentUserConsoleAdmin = isCurrentUserConsole && currentUser?.role === "ADMIN";
  const isTargetUserConsoleAdmin = user.account_type === "CONSOLE" && user.role === "ADMIN";
  const isTargetUserClient = user.account_type === "CLIENT";
  
  const isEditingSelf = currentUser?.id === user.id;
  
  const canEditAccountType = isCurrentUserConsoleAdmin;
  const canEditRole = isCurrentUserConsole && (isTargetUserClient || isEditingSelf || isCurrentUserConsoleAdmin);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      role: user.role as "ADMIN" | "STANDARD",
      account_type: user.account_type as "CONSOLE" | "CLIENT",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: user.name || "",
        role: user.role as "ADMIN" | "STANDARD",
        account_type: user.account_type as "CONSOLE" | "CLIENT",
      });
      setEditMode(false);
    }
  }, [open, user, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating user profile with data:", data);
      
      const updates: { 
        name?: string; 
        role?: "ADMIN" | "STANDARD";
        account_type?: "CONSOLE" | "CLIENT";
      } = {};
      
      if (data.name !== user.name) {
        updates.name = data.name;
      }
      
      if (data.role !== user.role) {
        updates.role = data.role;
      }
      
      if (data.account_type !== user.account_type) {
        updates.account_type = data.account_type;
      }
      
      if (Object.keys(updates).length > 0) {
        const result = await updateUserProfile(user.id, updates);
        
        if (result.success) {
          toast.success(`User ${data.name} updated successfully`);
          if (Object.keys(result.appliedUpdates).length === 0) {
            toast.info("No changes were applied due to permission restrictions");
          }
          setEditMode(false);
          onUserEdited();
        }
      } else {
        toast.info("No changes detected");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit User" : "User Details"}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? "Update user details and permissions."
              : "View user information and manage settings."
            }
            {!isCurrentUserConsole && editMode && (
              <div className="mt-2 text-amber-500 text-xs">
                Note: Some fields are disabled based on your permissions.
              </div>
            )}
            {isCurrentUserConsole && !isCurrentUserConsoleAdmin && !isTargetUserClient && !isEditingSelf && editMode && (
              <div className="mt-2 text-amber-500 text-xs">
                Note: You cannot modify other CONSOLE users unless you are a CONSOLE ADMIN.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="bg-slate-50 p-3 rounded-md mb-4">
              <p className="text-sm text-slate-500">Email: {user.email}</p>
              <p className="text-sm text-slate-500">Created: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        className="pl-10" 
                        placeholder="Enter user name" 
                        {...field} 
                        disabled={!editMode}
                        readOnly={!editMode}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!editMode || !canEditRole}
                  >
                    <FormControl>
                      <SelectTrigger className={`w-full ${(!editMode || !canEditRole) ? 'opacity-60' : ''}`}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-500" />
                          <span>ADMIN</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="STANDARD">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-slate-500" />
                          <span>STANDARD</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!canEditRole && editMode && (
                    <FormDescription className="text-amber-500">
                      {!isCurrentUserConsole
                        ? "You don't have permission to change role"
                        : "You don't have permission to change this user's role"}
                    </FormDescription>
                  )}
                  {(!editMode || canEditRole) && (
                    <FormDescription>
                      Permission level for this user
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!editMode || !canEditAccountType}
                  >
                    <FormControl>
                      <SelectTrigger className={`w-full ${(!editMode || !canEditAccountType) ? 'opacity-60' : ''}`}>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CONSOLE">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-blue-500" />
                          <span>CONSOLE</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CLIENT">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-green-500" />
                          <span>CLIENT</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!canEditAccountType && editMode && (
                    <FormDescription className="text-amber-500">
                      Only CONSOLE ADMIN users can change account type
                    </FormDescription>
                  )}
                  {(!editMode || canEditAccountType) && (
                    <FormDescription>
                      Type of account for this user
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 flex gap-2">
              {!editMode ? (
                <>
                  <div className="flex-1 flex justify-start">
                    {canDelete && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onDeleteClick}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </Button>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                  {canEdit && (
                    <Button 
                      type="button" 
                      onClick={() => setEditMode(true)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit User
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditMode(false)}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || (!isTargetUserClient && !isEditingSelf && !isCurrentUserConsoleAdmin)}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserDialog;
