
import { supabase } from "@/integrations/supabase/client";
import { Director, DirectorFormData, ClientDirector } from "@/types/director";
import { ClientBusiness } from "@/types/client";

export async function getDirectors(): Promise<Director[]> {
  const { data, error } = await supabase
    .from('directors')
    .select('*')
    .order('full_name');

  if (error) {
    console.error("Error fetching directors:", error);
    throw error;
  }

  return data || [];
}

export async function getDirector(id: string): Promise<Director | null> {
  const { data, error } = await supabase
    .from('directors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching director with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function createDirector(director: DirectorFormData): Promise<Director> {
  // Clean up empty date fields before saving
  const directorToSave = { ...director };
  if (directorToSave.date_of_appointment === '') {
    directorToSave.date_of_appointment = null;
  }
  if (directorToSave.date_of_resignation === '') {
    directorToSave.date_of_resignation = null;
  }

  const { data, error } = await supabase
    .from('directors')
    .insert([directorToSave])
    .select()
    .single();

  if (error) {
    console.error("Error creating director:", error);
    throw error;
  }

  return data;
}

export async function updateDirector(id: string, director: DirectorFormData): Promise<Director> {
  // Clean up empty date fields before saving
  const directorToUpdate = { ...director };
  if (directorToUpdate.date_of_appointment === '') {
    directorToUpdate.date_of_appointment = null;
  }
  if (directorToUpdate.date_of_resignation === '') {
    directorToUpdate.date_of_resignation = null;
  }

  const { data, error } = await supabase
    .from('directors')
    .update(directorToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating director with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteDirector(id: string): Promise<void> {
  const { error } = await supabase
    .from('directors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting director with id ${id}:`, error);
    throw error;
  }
}

export async function getClientDirectors(clientId: string): Promise<Director[]> {
  const { data, error } = await supabase
    .from('client_directors')
    .select('director_id')
    .eq('client_business_id', clientId);

  if (error) {
    console.error(`Error fetching directors for client ${clientId}:`, error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  const directorIds = data.map(cd => cd.director_id);
  
  const { data: directors, error: directorsError } = await supabase
    .from('directors')
    .select('*')
    .in('id', directorIds)
    .order('full_name'); // Sort directors by name

  if (directorsError) {
    console.error("Error fetching directors by ids:", directorsError);
    throw directorsError;
  }

  return directors || [];
}

export async function associateDirectorWithClient(
  directorId: string, 
  clientId: string
): Promise<ClientDirector> {
  const { data, error } = await supabase
    .from('client_directors')
    .insert([{
      director_id: directorId,
      client_business_id: clientId
    }])
    .select()
    .single();

  if (error) {
    console.error(`Error associating director ${directorId} with client ${clientId}:`, error);
    throw error;
  }

  return data;
}

export async function removeDirectorFromClient(
  directorId: string, 
  clientId: string
): Promise<void> {
  const { error } = await supabase
    .from('client_directors')
    .delete()
    .match({
      director_id: directorId,
      client_business_id: clientId
    });

  if (error) {
    console.error(`Error removing director ${directorId} from client ${clientId}:`, error);
    throw error;
  }
}

export async function getAssociatedClients(directorId: string): Promise<ClientBusiness[]> {
  const { data: clientDirectors, error } = await supabase
    .from('client_directors')
    .select('client_business_id')
    .eq('director_id', directorId);

  if (error) {
    console.error(`Error fetching clients for director ${directorId}:`, error);
    throw error;
  }

  if (!clientDirectors || clientDirectors.length === 0) {
    return [];
  }

  const clientIds = clientDirectors.map(cd => cd.client_business_id);
  
  const { data: clients, error: clientsError } = await supabase
    .from('client_businesses')
    .select('*')
    .in('id', clientIds)
    .order('name'); // Sort clients alphabetically

  if (clientsError) {
    console.error("Error fetching clients by ids:", clientsError);
    throw clientsError;
  }

  return clients.map(client => ({
    id: client.id,
    name: client.name,
    contactName: client.contact_name,
    email: client.email,
    phone: client.phone || undefined,
    industry: client.industry || undefined,
    tenantId: client.tenant_id || undefined,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
    createdBy: client.created_by || undefined
  })) || [];
}

export async function getNonAssociatedDirectors(clientId: string): Promise<Director[]> {
  // First, get all currently associated director IDs
  const { data: clientDirectors, error: clientDirectorsError } = await supabase
    .from('client_directors')
    .select('director_id')
    .eq('client_business_id', clientId);

  if (clientDirectorsError) {
    console.error(`Error fetching associated directors for client ${clientId}:`, clientDirectorsError);
    throw clientDirectorsError;
  }

  // Get all directors 
  const { data: allDirectors, error: directorsError } = await supabase
    .from('directors')
    .select('*')
    .order('full_name'); // Sort directors alphabetically

  if (directorsError) {
    console.error("Error fetching all directors:", directorsError);
    throw directorsError;
  }

  if (!clientDirectors || clientDirectors.length === 0) {
    // No associated directors, return all directors
    return allDirectors || [];
  }

  // Filter out already associated directors
  const associatedDirectorIds = clientDirectors.map(cd => cd.director_id);
  return allDirectors.filter(director => !associatedDirectorIds.includes(director.id)) || [];
}
