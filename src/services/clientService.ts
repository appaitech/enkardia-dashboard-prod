
import { supabase } from "@/integrations/supabase/client";
import { ClientBusiness, NewClientBusiness } from "@/types/client";

/**
 * Fetch all client businesses
 * 
 * @returns A promise that resolves to an array of client businesses
 */
export const getClientBusinesses = async (): Promise<ClientBusiness[]> => {
  const { data, error } = await supabase
    .from("client_businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching client businesses:", error);
    throw new Error(error.message);
  }

  return data as ClientBusiness[];
};

/**
 * Fetch a client business by ID
 * 
 * @param id The ID of the client business to fetch
 * @returns A promise that resolves to a client business
 */
export const getClientBusinessById = async (id: string): Promise<ClientBusiness> => {
  const { data, error } = await supabase
    .from("client_businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching client business:", error);
    throw new Error(error.message);
  }

  return data as ClientBusiness;
};

/**
 * Create a new client business
 * 
 * @param client The client business data to create
 * @returns A promise that resolves to the created client business
 */
export const createClientBusiness = async (client: NewClientBusiness): Promise<ClientBusiness> => {
  const { data, error } = await supabase
    .from("client_businesses")
    .insert([client])
    .select()
    .single();

  if (error) {
    console.error("Error creating client business:", error);
    throw new Error(error.message);
  }

  return data as ClientBusiness;
};

/**
 * Update a client business
 * 
 * @param id The ID of the client business to update
 * @param updates The updates to apply to the client business
 * @returns A promise that resolves to the updated client business
 */
export const updateClientBusiness = async (id: string, updates: Partial<ClientBusiness>): Promise<ClientBusiness> => {
  const { data, error } = await supabase
    .from("client_businesses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client business:", error);
    throw new Error(error.message);
  }

  return data as ClientBusiness;
};

/**
 * Delete a client business
 * 
 * @param id The ID of the client business to delete
 * @returns A promise that resolves when the client business is deleted
 */
export const deleteClientBusiness = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("client_businesses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting client business:", error);
    throw new Error(error.message);
  }
};

/**
 * Connect a client business to Xero
 * 
 * @param id The ID of the client business to connect to Xero
 * @returns A promise that resolves when the client business is connected to Xero
 */
export const connectClientBusinessToXero = async (id: string): Promise<ClientBusiness> => {
  // In a real implementation, this would involve OAuth with Xero
  // For now, we'll just update the xero_connected field
  return updateClientBusiness(id, { xeroConnected: true });
};
