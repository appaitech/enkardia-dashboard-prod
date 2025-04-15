
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates user metadata in Supabase Auth and profiles table
 * @param userId The user's ID
 * @param metadata The metadata to update
 * @returns 
 */
export const updateUserMetadata = async (
  userId: string, 
  metadata: Record<string, any>
): Promise<void> => {
  try {
    // Update the user's metadata in Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: metadata
    });

    if (authError) {
      throw authError;
    }

    // Also update the profiles table if it exists
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ...metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.warn('Error updating profile table:', profileError);
      // Don't throw here as the auth update was successful
    }

  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw error;
  }
};

/**
 * Gets a user's metadata from Supabase
 * @param userId The user's ID
 * @returns The user's metadata
 */
export const getUserMetadata = async (userId: string): Promise<Record<string, any> | null> => {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      throw error;
    }
    
    return data.user.user_metadata || null;
  } catch (error) {
    console.error('Error getting user metadata:', error);
    throw error;
  }
};
