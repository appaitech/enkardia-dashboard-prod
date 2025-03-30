
import { supabase } from "@/integrations/supabase/client";
import { ClientBusiness, NewClientBusiness } from "@/types/client";

// Helper function to map database column names to our TypeScript interface
const mapDbClientToClientBusiness = (dbClient: any): ClientBusiness => {
  return {
    id: dbClient.id,
    name: dbClient.name,
    contactName: dbClient.contact_name,
    email: dbClient.email,
    phone: dbClient.phone || undefined,
    industry: dbClient.industry || undefined,
    xeroConnected: dbClient.xero_connected,
    createdAt: dbClient.created_at,
    updatedAt: dbClient.updated_at,
    createdBy: dbClient.created_by || undefined
  };
};

// Helper function to map our TypeScript interface to database column names
const mapClientBusinessToDbClient = (client: NewClientBusiness) => {
  return {
    name: client.name,
    contact_name: client.contactName,
    email: client.email,
    phone: client.phone,
    industry: client.industry,
    xero_connected: client.xeroConnected
  };
};

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

  return data.map(mapDbClientToClientBusiness);
};

/**
 * Search for client businesses based on a query string
 * 
 * @param query The search query
 * @returns A promise that resolves to an array of matching client businesses
 */
export const searchClientBusinesses = async (query: string): Promise<ClientBusiness[]> => {
  const searchTerm = `%${query}%`;
  const { data, error } = await supabase
    .from("client_businesses")
    .select("*")
    .or(`name.ilike.${searchTerm},contact_name.ilike.${searchTerm},email.ilike.${searchTerm},industry.ilike.${searchTerm}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching client businesses:", error);
    throw new Error(error.message);
  }

  return data.map(mapDbClientToClientBusiness);
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

  return mapDbClientToClientBusiness(data);
};

/**
 * Create a new client business
 * 
 * @param client The client business data to create
 * @returns A promise that resolves to the created client business
 */
export const createClientBusiness = async (client: NewClientBusiness): Promise<ClientBusiness> => {
  const dbClient = mapClientBusinessToDbClient(client);
  
  const { data, error } = await supabase
    .from("client_businesses")
    .insert(dbClient)
    .select()
    .single();

  if (error) {
    console.error("Error creating client business:", error);
    throw new Error(error.message);
  }

  return mapDbClientToClientBusiness(data);
};

/**
 * Update a client business
 * 
 * @param id The ID of the client business to update
 * @param updates The updates to apply to the client business
 * @returns A promise that resolves to the updated client business
 */
export const updateClientBusiness = async (id: string, updates: Partial<ClientBusiness>): Promise<ClientBusiness> => {
  const dbUpdates: any = {};
  
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.contactName) dbUpdates.contact_name = updates.contactName;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
  if (updates.xeroConnected !== undefined) dbUpdates.xero_connected = updates.xeroConnected;
  
  const { data, error } = await supabase
    .from("client_businesses")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client business:", error);
    throw new Error(error.message);
  }

  return mapDbClientToClientBusiness(data);
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
