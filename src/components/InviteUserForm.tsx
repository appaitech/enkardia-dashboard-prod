import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createInvitation } from "@/services/invitationService";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface InviteUserFormProps {
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InviteUserForm = ({
  clientId,
  clientName,
  onSuccess,
  onCancel,
}: InviteUserFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
  });
  
  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Create invitation in database
      const result = await createInvitation(data.email, clientId);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      if (result.token) {
        // New user - send invitation email
        const response = await supabase.functions.invoke("send-invitation", {
          body: {
            email: data.email,
            businessName: clientName,
            token: result.token,
          },
        });
        
        if (response.error) {
          throw new Error("Failed to send invitation email");
        }
        
        toast.success(`Invitation sent to ${data.email}`);
      } else {
        // Existing user - just show success message
        toast.success(`${data.email} has been added to this client`);
      }
      
      reset();
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error("Error inviting user:", err);
      setError(err.message || "Failed to invite user");
      toast.error("Failed to invite user");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            id="email"
            placeholder="user@example.com"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </div>
    </form>
  );
};

export default InviteUserForm;
