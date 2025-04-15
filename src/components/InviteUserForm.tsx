
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { assignUserToClientBusiness } from "@/services/invitationService";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  clientBusinessId: z.string().min(1, "Please select a client business"),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface ClientBusiness {
  id: string;
  name: string;
}

interface InviteUserFormProps {
  clientId?: string;
  clientName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showClientSelect?: boolean;
}

const InviteUserForm = ({
  clientId,
  clientName,
  onSuccess,
  onCancel,
  showClientSelect = false,
}: InviteUserFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientBusinesses, setClientBusinesses] = useState<ClientBusiness[]>([]);
  
  const {
    register,
    handleSubmit: formHandleSubmit,
    reset,
    setValue,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      clientBusinessId: clientId || "",
    },
  });
  
  useEffect(() => {
    // If clientId is provided, set it as the default value
    if (clientId) {
      setValue("clientBusinessId", clientId);
    }
    
    // If we need to show client select dropdown, fetch client businesses
    if (showClientSelect) {
      const fetchClientBusinesses = async () => {
        try {
          const { data, error } = await supabase
            .from("client_businesses")
            .select("id, name")
            .order("name");
          
          if (error) throw error;
          setClientBusinesses(data || []);
        } catch (err) {
          console.error("Error fetching client businesses:", err);
          toast.error("Failed to load client businesses");
        }
      };
      
      fetchClientBusinesses();
    }
  }, [clientId, setValue, showClientSelect]);
  
  const handleFormSubmit = async () => {
    // Validate form data
    const isValid = await trigger();
    if (!isValid) {
      return;
    }
    
    const data = getValues();
    setIsLoading(true);
    setError("");
    
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.email);
      
      if (existingUsers && existingUsers.length > 0) {
        const userId = existingUsers[0].id;
        
        // Check if the user is already associated with this client business
        const { data: existingAssociation } = await supabase
          .from("user_client_businesses")
          .select("id")
          .eq("user_id", userId)
          .eq("client_business_id", data.clientBusinessId);
        
        if (existingAssociation && existingAssociation.length > 0) {
          setError("User is already associated with this client business");
          toast.error("User is already associated with this client business");
          return;
        }
        
        // Associate existing user with the client business
        await assignUserToClientBusiness(userId, data.clientBusinessId);
        
        toast.success(`${data.email} has been added to this client`);
        reset();
        if (onSuccess) onSuccess();
        return;
      }
      
      // For new users, generate a unique token
      const token = crypto.randomUUID();
      
      // Get the selected client business name
      let selectedClientName = clientName;
      if (!selectedClientName && data.clientBusinessId) {
        const { data: businessData } = await supabase
          .from("client_businesses")
          .select("name")
          .eq("id", data.clientBusinessId)
          .single();
        
        selectedClientName = businessData?.name || "our platform";
      }
      
      // Create new invitation
      const { error: invitationError } = await supabase
        .from("invitations")
        .insert({
          email: data.email,
          client_business_id: data.clientBusinessId,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        });
      
      if (invitationError) {
        console.error("Error creating invitation:", invitationError);
        throw new Error("Failed to create invitation");
      }
      
      // Send invitation email
      const response = await supabase.functions.invoke("send-invitation", {
        body: {
          email: data.email,
          businessName: selectedClientName,
          token: token,
        },
      });
      
      if (response.error) {
        throw new Error("Failed to send invitation email");
      }
      
      toast.success(`Invitation sent to ${data.email}`);
      reset();
      if (onSuccess) onSuccess();
      
    } catch (err: any) {
      console.error("Error inviting user:", err);
      setError(err.message || "Failed to invite user");
      toast.error("Failed to invite user");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
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
      
      {showClientSelect && (
        <div className="space-y-2">
          <Label htmlFor="clientBusinessId">Client Business</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Select 
              onValueChange={(value) => setValue("clientBusinessId", value)} 
              defaultValue={clientId}
            >
              <SelectTrigger className="w-full pl-10">
                <SelectValue placeholder="Select a client business" />
              </SelectTrigger>
              <SelectContent>
                {clientBusinesses.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.clientBusinessId && (
            <p className="text-sm text-red-500">{errors.clientBusinessId.message}</p>
          )}
        </div>
      )}
      
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
        <Button type="button" disabled={isLoading} onClick={handleFormSubmit}>
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </div>
    </div>
  );
};

export default InviteUserForm;
