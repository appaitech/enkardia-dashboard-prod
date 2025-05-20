
import { supabase } from "@/integrations/supabase/client";
import { ClientActivity, ClientActivityFormData } from "@/types/clientActivity";

export async function getClientActivities(clientId: string): Promise<ClientActivity[]> {
  // First, get the client activities
  const { data: activities, error } = await supabase
    .from('client_activities')
    .select(`
      id,
      client_business_id,
      content,
      activity_date,
      created_at,
      updated_at,
      created_by,
      updated_by
    `)
    .eq('client_business_id', clientId)
    .order('activity_date', { ascending: false });

  if (error) {
    console.error("Error fetching client activities:", error);
    throw error;
  }

  // Get array of unique user IDs from the activities
  const userIds = [...new Set([
    ...activities.map(a => a.created_by),
    ...activities.map(a => a.updated_by)
  ])];

  // Fetch user profiles separately for those IDs
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  // Create a map of user IDs to names
  const userNameMap = new Map();
  profiles?.forEach(profile => {
    userNameMap.set(profile.id, profile.name || 'Unknown');
  });

  // Map the activities with user names
  return (activities || []).map(item => ({
    id: item.id,
    clientBusinessId: item.client_business_id,
    content: item.content,
    activityDate: item.activity_date,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by,
    createdByName: userNameMap.get(item.created_by) || 'Unknown',
    updatedByName: userNameMap.get(item.updated_by) || 'Unknown'
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
      updated_by
    `)
    .single();

  if (error) {
    console.error("Error creating client activity:", error);
    throw error;
  }

  // Get the creator's profile information
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  return {
    id: data.id,
    clientBusinessId: data.client_business_id,
    content: data.content,
    activityDate: data.activity_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    createdByName: creatorProfile?.name || 'Unknown',
    updatedByName: creatorProfile?.name || 'Unknown'
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
      updated_by
    `)
    .single();

  if (error) {
    console.error("Error updating client activity:", error);
    throw error;
  }

  // Get creator and updater profile information separately
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', [data.created_by, data.updated_by]);

  // Create a map of user IDs to names
  const userNameMap = new Map();
  profiles?.forEach(profile => {
    userNameMap.set(profile.id, profile.name || 'Unknown');
  });

  return {
    id: data.id,
    clientBusinessId: data.client_business_id,
    content: data.content,
    activityDate: data.activity_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    createdByName: userNameMap.get(data.created_by) || 'Unknown',
    updatedByName: userNameMap.get(data.updated_by) || 'Unknown'
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
