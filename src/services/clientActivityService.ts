
import { supabase } from "@/integrations/supabase/client";

export interface ClientActivity {
  id: string;
  clientBusinessId: string;
  content: string;
  activityDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  createdByName: string;
  updatedByName: string;
}

export interface ClientActivityFormData {
  clientBusinessId: string;
  content: string;
  activityDate: Date;
}

export async function getClientActivities(clientId: string): Promise<ClientActivity[]> {
  const { data, error } = await supabase
    .from('client_activities')
    .select(`
      id,
      client_business_id,
      content,
      activity_date,
      created_at,
      updated_at,
      created_by,
      updated_by,
      created_by_profile:profiles!created_by(name),
      updated_by_profile:profiles!updated_by(name)
    `)
    .eq('client_business_id', clientId)
    .order('activity_date', { ascending: false });

  if (error) {
    console.error("Error fetching client activities:", error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    clientBusinessId: item.client_business_id,
    content: item.content,
    activityDate: item.activity_date,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by,
    createdByName: item.created_by_profile?.name || 'Unknown',
    updatedByName: item.updated_by_profile?.name || 'Unknown'
  }));
}

export async function createClientActivity(
  activityData: ClientActivityFormData
): Promise<ClientActivity> {
  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to create an activity");
  }

  const { data, error } = await supabase
    .from('client_activities')
    .insert({
      client_business_id: activityData.clientBusinessId,
      content: activityData.content,
      activity_date: activityData.activityDate.toISOString(),
      created_by: user.id,
      updated_by: user.id
    })
    .select(`
      id,
      client_business_id,
      content,
      activity_date,
      created_at,
      updated_at,
      created_by,
      updated_by,
      created_by_profile:profiles!created_by(name),
      updated_by_profile:profiles!updated_by(name)
    `)
    .single();

  if (error) {
    console.error("Error creating client activity:", error);
    throw error;
  }

  return {
    id: data.id,
    clientBusinessId: data.client_business_id,
    content: data.content,
    activityDate: data.activity_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    createdByName: data.created_by_profile?.name || 'Unknown',
    updatedByName: data.updated_by_profile?.name || 'Unknown'
  };
}

export async function updateClientActivity(
  id: string,
  updates: {
    content?: string;
    activityDate?: Date;
  }
): Promise<ClientActivity> {
  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to update an activity");
  }

  const updateData: any = { updated_by: user.id };
  
  if (updates.content !== undefined) {
    updateData.content = updates.content;
  }
  
  if (updates.activityDate !== undefined) {
    updateData.activity_date = updates.activityDate.toISOString();
  }

  const { data, error } = await supabase
    .from('client_activities')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      client_business_id,
      content,
      activity_date,
      created_at,
      updated_at,
      created_by,
      updated_by,
      created_by_profile:profiles!created_by(name),
      updated_by_profile:profiles!updated_by(name)
    `)
    .single();

  if (error) {
    console.error("Error updating client activity:", error);
    throw error;
  }

  return {
    id: data.id,
    clientBusinessId: data.client_business_id,
    content: data.content,
    activityDate: data.activity_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    createdByName: data.created_by_profile?.name || 'Unknown',
    updatedByName: data.updated_by_profile?.name || 'Unknown'
  };
}

export async function deleteClientActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from('client_activities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting client activity:", error);
    throw error;
  }
}
