
import { supabase } from "@/integrations/supabase/client";
import { DbClientBusiness } from "@/types/client";

/**
 * Fetch client businesses for a specific user
 * 
 * @param userId The ID of the user
 * @returns A promise that resolves to an array of client businesses
 */
export const getUserClientBusinesses = async (userId: string): Promise<DbClientBusiness[]> => {
  if (!userId) {
    console.error("No user ID provided to getUserClientBusinesses");
    return [];
  }

  console.log("Fetching client businesses for user:", userId);

  const { data, error } = await supabase
    .from("user_client_businesses")
    .select(`
      client_business_id,
      client_businesses:client_business_id (
        id, 
        name, 
        contact_name, 
        email, 
        phone, 
        industry, 
        tenant_id, 
        created_at, 
        updated_at
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user client businesses:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    console.log("No client businesses found for user:", userId);
    return [];
  }

  // Extract the client businesses from the joined data
  const clientBusinesses = data.map(item => item.client_businesses as DbClientBusiness)
    .filter(business => business !== null);

  console.log(`Found ${clientBusinesses.length} client businesses for user:`, userId);
  return clientBusinesses;
};

/**
 * Get the currently selected client business ID from localStorage
 * or null if none is selected
 */
export const getSelectedClientBusinessId = (): string | null => {
  return localStorage.getItem('selectedClientBusinessId');
};

/**
 * Save the selected client business ID to localStorage
 */
export const saveSelectedClientBusinessId = (businessId: string): void => {
  localStorage.setItem('selectedClientBusinessId', businessId);
};
