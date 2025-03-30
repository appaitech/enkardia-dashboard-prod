
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

/**
 * Create an invitation for a user to join a client business
 */
export const createInvitation = async (
  email: string,
  clientBusinessId: string
): Promise<{ success: boolean; message: string; token?: string }> => {
  try {
    // Check if the user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      // User exists, associate them with the client business directly
      const { error: associationError } = await supabase
        .from("user_client_businesses")
        .insert({
          user_id: existingUser.id,
          client_business_id: clientBusinessId,
        });

      if (associationError) {
        console.error("Error associating existing user:", associationError);
        return {
          success: false,
          message: "Error associating user to client business",
        };
      }

      return {
        success: true,
        message: "User already exists and has been associated with this business",
      };
    }

    // User doesn't exist, create an invitation
    const token = uuidv4();
    
    const { error: invitationError } = await supabase.from("invitations").insert({
      email,
      client_business_id: clientBusinessId,
      token,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return { success: false, message: "Error creating invitation" };
    }

    // Return the token so it can be used in the invitation email
    return {
      success: true,
      message: "Invitation created successfully",
      token,
    };
  } catch (error) {
    console.error("Error in createInvitation:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
};

/**
 * Check if an invitation token is valid
 */
export const isValidInvitationToken = async (
  token: string
): Promise<boolean> => {
  try {
    console.log("Checking if token is valid:", token);
    
    // Instead of using the RPC function, check directly to make sure we're using the same logic
    // as in getInvitationDetails
    const { data, error } = await supabase
      .from("invitations")
      .select("id")
      .eq("token", token.trim())
      .is("accepted", false)
      .gt("expires_at", new Date().toISOString());
    
    if (error) {
      console.error("Error checking invitation token:", error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log("Token is valid, found invitation with id:", data[0].id);
      return true;
    }
    
    console.log("Token is invalid, no active invitations found");
    return false;
  } catch (error) {
    console.error("Error in isValidInvitationToken:", error);
    return false;
  }
};

/**
 * Get details about an invitation from its token
 */
export const getInvitationDetails = async (
  token: string
): Promise<{ email: string; clientBusinessId: string } | null> => {
  try {
    // Log that we're trying to get the invitation details with a specific token
    console.log("Fetching invitation with token:", token);
    
    // Get all invitations to check if there are any in the system
    const { data: allInvitations, error: invitationsError } = await supabase
      .from("invitations")
      .select("id, token")
      .limit(10);
    
    if (invitationsError) {
      console.error("Error getting all invitations:", invitationsError);
    } else {
      console.log("Total invitations in database:", allInvitations ? allInvitations.length : 0);
      console.log("Sample invitation tokens:", allInvitations);
      
      if (allInvitations && allInvitations.length > 0) {
        // Check if the token exists in the database using exact match or with different case
        const matchingInvitation = allInvitations.find(inv => 
          inv.token === token || 
          inv.token.toLowerCase() === token.toLowerCase()
        );
        
        if (matchingInvitation) {
          console.log("Found matching invitation by case-insensitive comparison:", matchingInvitation);
        } else {
          console.log("No matching invitation found, even with case-insensitive comparison");
        }
      }
    }
    
    // Perform the query to get the invitation details
    const { data, error } = await supabase
      .from("invitations")
      .select("email, client_business_id, accepted, expires_at")
      .eq("token", token.trim())
      .maybeSingle();

    if (error) {
      console.error("Error getting invitation details:", error);
      return null;
    }

    // If no data was found, return null
    if (!data) {
      console.log("No invitation found with token:", token);
      return null;
    }
    
    // Log additional information about the invitation that was found
    console.log("Found invitation:", {
      email: data.email,
      clientBusinessId: data.client_business_id,
      accepted: data.accepted,
      expiresAt: data.expires_at,
      expiryStatus: new Date(data.expires_at) > new Date() ? "Valid" : "Expired"
    });
    
    // Check if invitation has been accepted
    if (data.accepted) {
      console.log("Invitation has already been accepted");
      return null;
    }
    
    // Check if invitation has expired
    if (new Date(data.expires_at) < new Date()) {
      console.log("Invitation has expired");
      return null;
    }

    return {
      email: data.email,
      clientBusinessId: data.client_business_id,
    };
  } catch (error) {
    console.error("Error in getInvitationDetails:", error);
    return null;
  }
};

/**
 * Accept an invitation and associate the user with the client business
 */
export const acceptInvitation = async (
  token: string,
  userId: string
): Promise<boolean> => {
  try {
    // Instead of using RPC, we'll implement the logic directly to ensure consistency
    console.log(`Accepting invitation with token: ${token} for user: ${userId}`);
    
    // First, get the invitation details to make sure it exists and is valid
    const { data: invitation, error: fetchError } = await supabase
      .from("invitations")
      .select("client_business_id, accepted, expires_at")
      .eq("token", token.trim())
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error fetching invitation during accept:", fetchError);
      return false;
    }
    
    if (!invitation) {
      console.error("No invitation found with token:", token);
      return false;
    }
    
    if (invitation.accepted) {
      console.error("Invitation has already been accepted");
      return false;
    }
    
    if (new Date(invitation.expires_at) < new Date()) {
      console.error("Invitation has expired");
      return false;
    }
    
    // Mark the invitation as accepted
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ accepted: true })
      .eq("token", token.trim());
    
    if (updateError) {
      console.error("Error updating invitation status:", updateError);
      return false;
    }
    
    // Associate the user with the client business
    const { error: associationError } = await supabase
      .from("user_client_businesses")
      .insert({
        user_id: userId,
        client_business_id: invitation.client_business_id,
      });
    
    if (associationError) {
      console.error("Error creating user-business association:", associationError);
      return false;
    }
    
    console.log("Invitation accepted successfully");
    return true;
  } catch (error) {
    console.error("Error in acceptInvitation:", error);
    return false;
  }
};

/**
 * Get all client businesses associated with a user
 */
export const getUserClientBusinesses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_client_businesses")
      .select(`
        client_business_id,
        client_businesses:client_business_id (
          id,
          name,
          industry,
          email,
          contact_name,
          phone,
          xero_connected,
          created_at
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user client businesses:", error);
      return [];
    }

    return data?.map(item => item.client_businesses) || [];
  } catch (error) {
    console.error("Error in getUserClientBusinesses:", error);
    return [];
  }
};

/**
 * Delete an invitation
 */
export const deleteInvitation = async (
  invitationId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId);

    if (error) {
      console.error("Error deleting invitation:", error);
      return {
        success: false,
        message: "Error deleting invitation"
      };
    }

    return {
      success: true,
      message: "Invitation deleted successfully"
    };
  } catch (error) {
    console.error("Error in deleteInvitation:", error);
    return {
      success: false,
      message: "An unexpected error occurred"
    };
  }
};

/**
 * Remove a user's access to a client business
 */
export const removeUserFromClientBusiness = async (
  userId: string,
  clientBusinessId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from("user_client_businesses")
      .delete()
      .eq("user_id", userId)
      .eq("client_business_id", clientBusinessId);

    if (error) {
      console.error("Error removing user from client business:", error);
      return {
        success: false,
        message: "Error removing user from client business"
      };
    }

    return {
      success: true,
      message: "User removed from client business successfully"
    };
  } catch (error) {
    console.error("Error in removeUserFromClientBusiness:", error);
    return {
      success: false,
      message: "An unexpected error occurred"
    };
  }
};
