
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Shield, Monitor, Smartphone } from "lucide-react";
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

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  onUserEdited: () => void;
  isAdmin: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onUserEdited,
  isAdmin,
}) => {
  const { user: currentUser, updateUserProfile } = useAuth();
  
  // Determine if the current user can edit the account type
  const canEditAccountType = isAdmin;
  
  // Determine if the current user can edit the role
  const canEditRole = isAdmin || 
    (currentUser?.accountType === "CONSOLE" && user.account_type === "CLIENT");
  
  // Current user is editing themselves
  const isEditingSelf = currentUser?.id === user.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      role: user.role as "ADMIN" | "STANDARD",
      account_type: user.account_type as "CONSOLE" | "CLIENT",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: user.name || "",
        role: user.role as "ADMIN" | "STANDARD",
        account_type: user.account_type as "CONSOLE" | "CLIENT",
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: FormValues) => {
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
      
      if (canEditRole && data.role !== user.role) {
        updates.role = data.role;
      }
      
      if (canEditAccountType && data.account_type !== user.account_type) {
        updates.account_type = data.account_type;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.id, updates);
        toast.success(`User ${data.name} updated successfully`);
      } else {
        toast.info("No changes detected");
      }
      
      onUserEdited();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and permissions.
            {!isAdmin && !canEditRole && (
              <div className="mt-2 text-amber-500 text-xs">
                Note: Some fields are disabled based on your permissions.
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
                      <Input className="pl-10" placeholder="Enter user name" {...field} />
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
                    disabled={!canEditRole}
                  >
                    <FormControl>
                      <SelectTrigger className={`w-full ${!canEditRole ? 'opacity-60' : ''}`}>
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
                  {!canEditRole && (
                    <FormDescription className="text-amber-500">
                      You don't have permission to change role
                    </FormDescription>
                  )}
                  {canEditRole && (
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
                    disabled={!canEditAccountType}
                  >
                    <FormControl>
                      <SelectTrigger className={`w-full ${!canEditAccountType ? 'opacity-60' : ''}`}>
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
                  {!canEditAccountType && (
                    <FormDescription className="text-amber-500">
                      Only admins can change account type
                    </FormDescription>
                  )}
                  {canEditAccountType && (
                    <FormDescription>
                      Type of account for this user
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
