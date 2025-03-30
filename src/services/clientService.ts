
import { ClientBusiness, NewClientBusiness } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Service functions
export const getClientBusinesses = async (): Promise<ClientBusiness[]> => {
  try {
    const { data, error } = await supabase
      .from("client_businesses")
      .select("*")
      .order("name");
      
    if (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
      throw error;
    }
    
    // Transform from snake_case to camelCase
    return data.map((client) => ({
      id: client.id,
      name: client.name,
      contactName: client.contact_name,
      email: client.email,
      phone: client.phone || undefined,
      industry: client.industry || undefined,
      xeroConnected: client.xero_connected,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      createdBy: client.created_by || undefined
    }));
  } catch (error) {
    console.error("Error in getClientBusinesses:", error);
    return [];
  }
};

export const getClientBusinessById = async (id: string): Promise<ClientBusiness | undefined> => {
  try {
    const { data, error } = await supabase
      .from("client_businesses")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code !== 'PGRST116') { // Not found error code
        console.error("Error fetching client:", error);
        toast.error("Failed to load client details");
      }
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone || undefined,
      industry: data.industry || undefined,
      xeroConnected: data.xero_connected,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined
    };
  } catch (error) {
    console.error("Error in getClientBusinessById:", error);
    return undefined;
  }
};

export const searchClientBusinesses = async (query: string): Promise<ClientBusiness[]> => {
  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const { data, error } = await supabase
      .from("client_businesses")
      .select("*")
      .or(`name.ilike.${searchTerm},contact_name.ilike.${searchTerm},email.ilike.${searchTerm},industry.ilike.${searchTerm}`);
      
    if (error) {
      console.error("Error searching clients:", error);
      toast.error("Failed to search clients");
      throw error;
    }
    
    // Transform from snake_case to camelCase
    return data.map((client) => ({
      id: client.id,
      name: client.name,
      contactName: client.contact_name,
      email: client.email,
      phone: client.phone || undefined,
      industry: client.industry || undefined,
      xeroConnected: client.xero_connected,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      createdBy: client.created_by || undefined
    }));
  } catch (error) {
    console.error("Error in searchClientBusinesses:", error);
    return [];
  }
};

export const createClientBusiness = async (client: NewClientBusiness): Promise<ClientBusiness | null> => {
  try {
    // Convert camelCase to snake_case for database
    const { data, error } = await supabase
      .from("client_businesses")
      .insert({
        name: client.name,
        contact_name: client.contactName,
        email: client.email,
        phone: client.phone,
        industry: client.industry,
        xero_connected: client.xeroConnected,
        created_by: supabase.auth.getUser().then(({ data }) => data?.user?.id)
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
      throw error;
    }
    
    // Transform from snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone || undefined,
      industry: data.industry || undefined,
      xeroConnected: data.xero_connected,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined
    };
  } catch (error) {
    console.error("Error in createClientBusiness:", error);
    return null;
  }
};

// Add update functionality as well
export const updateClientBusiness = async (id: string, updates: Partial<NewClientBusiness>): Promise<ClientBusiness | null> => {
  try {
    // Convert camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {};
    
    if ('name' in updates) dbUpdates.name = updates.name;
    if ('contactName' in updates) dbUpdates.contact_name = updates.contactName;
    if ('email' in updates) dbUpdates.email = updates.email;
    if ('phone' in updates) dbUpdates.phone = updates.phone;
    if ('industry' in updates) dbUpdates.industry = updates.industry;
    if ('xeroConnected' in updates) dbUpdates.xero_connected = updates.xeroConnected;
    
    const { data, error } = await supabase
      .from("client_businesses")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
      throw error;
    }
    
    // Transform from snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone || undefined,
      industry: data.industry || undefined,
      xeroConnected: data.xero_connected,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined
    };
  } catch (error) {
    console.error("Error in updateClientBusiness:", error);
    return null;
  }
};
