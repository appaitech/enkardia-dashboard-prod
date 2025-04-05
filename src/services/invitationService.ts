
import { supabase } from "@/integrations/supabase/client";

export interface Invitation {
  id: string;
  email: string;
  token: string;
  clientBusinessId: string;
  clientBusinessName?: string;
  expiresAt: string;
  createdAt: string;
  accepted: boolean;
}

/**
 * Create an invitation for a user to join a client business
 * 
 * @param email The email of the user to invite
 * @param clientBusinessId The ID of the client business
 * @returns A promise that resolves with the status of the invitation creation
 */
export const createInvitation = async (email: string, clientBusinessId: string): Promise<{success: boolean, message: string, token?: string}> => {
  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email);
    
    if (existingUsers && existingUsers.length > 0) {
      const userId = existingUsers[0].id;
      
      // Check if the user is already associated with this client business
      const { data: existingAssociation } = await supabase
        .from("user_client_businesses")
        .select("id")
        .eq("user_id", userId)
        .eq("client_business_id", clientBusinessId);
      
      if (existingAssociation && existingAssociation.length > 0) {
        return { success: false, message: "User is already associated with this client business" };
      }
      
      // Associate existing user with the client business
      const { error: associationError } = await supabase
        .from("user_client_businesses")
        .insert({ user_id: userId, client_business_id: clientBusinessId });
      
      if (associationError) {
        console.error("Error associating user with client business:", associationError);
        return { success: false, message: "Failed to associate user with client business" };
      }
      
      return { success: true, message: "Existing user has been associated with the client business" };
    }
    
    // Generate a unique token
    const token = crypto.randomUUID();
    
    // Create new invitation
    const { error } = await supabase
      .from("invitations")
      .insert({
        email,
        client_business_id: clientBusinessId,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });
    
    if (error) {
      console.error("Error creating invitation:", error);
      return { success: false, message: "Failed to create invitation" };
    }
    
    return { success: true, message: "Invitation created successfully", token };
  } catch (error: any) {
    console.error("Error in createInvitation:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

/**
 * Send an invitation to a user for a client business
 * 
 * @param email The email of the user to invite
 * @param clientBusinessId The ID of the client business
 * @returns A promise that resolves when the invitation is sent
 */
export const sendInvitation = async (email: string, clientBusinessId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke("send-invitation", {
      body: { email, clientBusinessId },
    });

    if (error) {
      console.error("Error sending invitation:", error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error("Error invoking send-invitation function:", error);
    throw new Error(error.message || "Failed to send invitation");
  }
};

/**
 * Get all invitations for a client business
 * 
 * @param clientBusinessId The ID of the client business
 * @returns A promise that resolves to an array of invitations
 */
export const getClientBusinessInvitations = async (clientBusinessId: string): Promise<Invitation[]> => {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("client_business_id", clientBusinessId)
    .eq("accepted", false);

  if (error) {
    console.error("Error fetching invitations:", error);
    throw new Error(error.message);
  }

  return data.map(invitation => ({
    id: invitation.id,
    email: invitation.email,
    token: invitation.token,
    clientBusinessId: invitation.client_business_id,
    expiresAt: invitation.expires_at,
    createdAt: invitation.created_at,
    accepted: invitation.accepted
  }));
};

/**
 * Check if an invitation token is valid
 * 
 * @param token The invitation token
 * @returns A promise that resolves to a boolean indicating if the token is valid
 */
export const isValidInvitationToken = async (token: string): Promise<boolean> => {
  try {
    // Verify token is valid
    const { data: isValid, error: validationError } = await supabase
      .rpc("is_valid_invitation_token", { token_input: token });

    if (validationError) {
      console.error("Error validating invitation token:", validationError);
      return false;
    }

    return isValid || false;
  } catch (error) {
    console.error("Error checking invitation token validity:", error);
    return false;
  }
};

/**
 * Get details about an invitation from a token
 * 
 * @param token The invitation token
 * @returns A promise that resolves to invitation details or null if not found
 */
export const getInvitationDetails = async (token: string): Promise<{email: string, clientBusinessId: string} | null> => {
  try {
    const { data, error } = await supabase
      .from("invitations")
      .select("email, client_business_id")
      .eq("token", token)
      .eq("accepted", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      console.error("Error getting invitation details:", error);
      return null;
    }

    return {
      email: data.email,
      clientBusinessId: data.client_business_id
    };
  } catch (error) {
    console.error("Error getting invitation details:", error);
    return null;
  }
};

/**
 * Accept an invitation
 * 
 * @param token The invitation token
 * @param userId The ID of the user accepting the invitation
 * @returns A promise that resolves to a boolean indicating if the acceptance was successful
 */
export const acceptInvitation = async (token: string, userId: string): Promise<boolean> => {
  try {
    // Verify token is valid
    const { data: isValid, error: validationError } = await supabase
      .rpc("is_valid_invitation_token", { token_input: token });

    if (validationError || !isValid) {
      console.error("Invalid or expired invitation token:", validationError);
      return false;
    }

    // Accept invitation
    const { data: acceptResult, error: acceptError } = await supabase
      .rpc("accept_invitation", { token_input: token, user_id_input: userId });

    if (acceptError || !acceptResult) {
      console.error("Error accepting invitation:", acceptError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return false;
  }
};

/**
 * Get details about a client business from an invitation token
 * 
 * @param token The invitation token
 * @returns A promise that resolves to the client business name or null if not found
 */
export const getClientBusinessFromToken = async (token: string): Promise<{id: string, name: string} | null> => {
  try {
    // Get business ID from token
    const { data: businessId, error: idError } = await supabase
      .rpc("get_client_business_from_token", { token_input: token });

    if (idError || !businessId) {
      console.error("Error getting business ID from token:", idError);
      return null;
    }

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from("client_businesses")
      .select("id, name")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      console.error("Error getting business details:", businessError);
      return null;
    }

    return { id: business.id, name: business.name };
  } catch (error) {
    console.error("Error getting client business from token:", error);
    return null;
  }
};

/**
 * Assign a user to a client business directly
 * 
 * @param userId The ID of the user to assign
 * @param clientBusinessId The ID of the client business
 * @returns A promise that resolves when the user is assigned
 */
export const assignUserToClientBusiness = async (userId: string, clientBusinessId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("user_client_businesses")
      .insert({ user_id: userId, client_business_id: clientBusinessId })
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        console.log("User is already assigned to this client business");
        return;
      }
      console.error("Error assigning user to client business:", error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error("Error assigning user to client business:", error);
    throw new Error(error.message || "Failed to assign user to client business");
  }
};

/**
 * Remove a user from a client business
 * 
 * @param userId The ID of the user to remove
 * @param clientBusinessId The ID of the client business
 * @returns A promise that resolves with information about the removal operation
 */
export const removeUserFromClientBusiness = async (userId: string, clientBusinessId: string): Promise<{success: boolean, message: string}> => {
  try {
    const { error } = await supabase
      .from("user_client_businesses")
      .delete()
      .match({ user_id: userId, client_business_id: clientBusinessId });

    if (error) {
      console.error("Error removing user from client business:", error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: "User removed successfully" };
  } catch (error: any) {
    console.error("Error removing user from client business:", error);
    return { success: false, message: error.message || "Failed to remove user from client business" };
  }
};

/**
 * Get users assigned to a client business
 * 
 * @param clientBusinessId The ID of the client business
 * @returns A promise that resolves to an array of users
 */
export const getClientBusinessUsers = async (clientBusinessId: string) => {
  const { data, error } = await supabase
    .from("user_client_businesses")
    .select(`
      user_id,
      profiles:user_id (
        id,
        name,
        email,
        role,
        account_type
      )
    `)
    .eq("client_business_id", clientBusinessId);

  if (error) {
    console.error("Error fetching client business users:", error);
    throw new Error(error.message);
  }

  return data.map(item => item.profiles);
};
