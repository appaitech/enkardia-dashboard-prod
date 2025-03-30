
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
    const { data, error } = await supabase.rpc("is_valid_invitation_token", {
      token_input: token,
    });

    if (error) {
      console.error("Error checking invitation token:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error in isValidInvitationToken:", error);
    return false;
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
    const { data, error } = await supabase.rpc("accept_invitation", {
      token_input: token,
      user_id_input: userId,
    });

    if (error) {
      console.error("Error accepting invitation:", error);
      return false;
    }

    return !!data;
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
