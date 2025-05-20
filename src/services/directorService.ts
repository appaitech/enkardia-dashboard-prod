
import { supabase } from "@/integrations/supabase/client";
import { Director, DirectorFormData, ClientDirector } from "@/types/director";

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
  const { data, error } = await supabase
    .from('directors')
    .insert([director])
    .select()
    .single();

  if (error) {
    console.error("Error creating director:", error);
    throw error;
  }

  return data;
}

export async function updateDirector(id: string, director: DirectorFormData): Promise<Director> {
  const { data, error } = await supabase
    .from('directors')
    .update(director)
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
    .in('id', directorIds);

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
