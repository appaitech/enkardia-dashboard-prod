
import { supabase } from "@/integrations/supabase/client";
import { CallToAction, CallToActionUrl, CallToActionView } from "@/types/callToAction";
import { toast } from "sonner";

// Fetch Call To Actions for a specific client business
export const fetchCallToActions = async (clientBusinessId: string): Promise<CallToAction[]> => {
  try {
    // Get all call to actions for client business
    const { data: callToActions, error } = await supabase
      .from("call_to_actions")
      .select("*")
      .eq("client_business_id", clientBusinessId)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    // Get URLs for each call to action
    const ctaWithUrls = await Promise.all(callToActions.map(async (cta) => {
      const { data: urls, error: urlError } = await supabase
        .from("call_to_action_urls")
        .select("*")
        .eq("call_to_action_id", cta.id);
        
      if (urlError) throw urlError;
      
      return {
        id: cta.id,
        clientBusinessId: cta.client_business_id,
        title: cta.title,
        description: cta.description,
        createdAt: cta.created_at,
        createdBy: cta.created_by,
        updatedAt: cta.updated_at,
        urls: urls.map(url => ({
          id: url.id,
          callToActionId: url.call_to_action_id,
          url: url.url,
          label: url.label,
        })),
      };
    }));
    
    return ctaWithUrls;
  } catch (error) {
    console.error("Error fetching call to actions:", error);
    toast.error("Failed to fetch call to actions");
    return [];
  }
};

// Create new Call To Action with URLs
export const createCallToAction = async (
  clientBusinessId: string,
  title: string,
  description: string | null,
  urls: { url: string; label: string | null }[]
): Promise<CallToAction | null> => {
  try {
    // Insert the Call To Action
    const { data: ctaData, error: ctaError } = await supabase
      .from("call_to_actions")
      .insert({
        client_business_id: clientBusinessId,
        title,
        description,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();
      
    if (ctaError) throw ctaError;
    
    // Insert URLs if any
    const urlPromises = urls.map(({ url, label }) => {
      return supabase
        .from("call_to_action_urls")
        .insert({
          call_to_action_id: ctaData.id,
          url,
          label,
        })
        .select();
    });
    
    const urlResults = await Promise.all(urlPromises);
    const urlErrors = urlResults.filter(result => result.error);
    
    if (urlErrors.length > 0) {
      console.error("Some URLs failed to insert:", urlErrors);
    }
    
    const urlData = urlResults
      .filter(result => !result.error)
      .flatMap(result => result.data || [])
      .map(url => ({
        id: url.id,
        callToActionId: url.call_to_action_id,
        url: url.url,
        label: url.label,
      }));
    
    return {
      id: ctaData.id,
      clientBusinessId: ctaData.client_business_id,
      title: ctaData.title,
      description: ctaData.description,
      createdAt: ctaData.created_at,
      createdBy: ctaData.created_by,
      updatedAt: ctaData.updated_at,
      urls: urlData,
    };
  } catch (error) {
    console.error("Error creating call to action:", error);
    toast.error("Failed to create call to action");
    return null;
  }
};

// Mark Call To Action as viewed by the current user
export const markCallToActionAsViewed = async (callToActionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("call_to_action_views")
      .upsert({
        call_to_action_id: callToActionId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error marking call to action as viewed:", error);
    toast.error("Failed to mark call to action as viewed");
    return false;
  }
};

// Get viewed status for Call To Actions
export const getViewedCallToActions = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("call_to_action_views")
      .select("call_to_action_id")
      .eq("user_id", userId);
      
    if (error) throw error;
    
    return data.map(view => view.call_to_action_id);
  } catch (error) {
    console.error("Error fetching viewed call to actions:", error);
    return [];
  }
};

// Get view count for Call To Actions
export const getCallToActionViewCount = async (callToActionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("call_to_action_views")
      .select("*", { count: 'exact', head: true })
      .eq("call_to_action_id", callToActionId);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error fetching call to action view count:", error);
    return 0;
  }
};

// Fetch Call To Actions with view status for client users
export const fetchCallToActionsWithViewStatus = async (clientBusinessIds: string[], userId: string): Promise<CallToAction[]> => {
  try {
    // Get all call to actions for client businesses
    const { data: callToActions, error } = await supabase
      .from("call_to_actions")
      .select("*")
      .in("client_business_id", clientBusinessIds)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    // Get viewed call to actions for the user
    const viewedIds = await getViewedCallToActions(userId);
    
    // Get URLs for each call to action
    const ctaWithUrls = await Promise.all(callToActions.map(async (cta) => {
      const { data: urls, error: urlError } = await supabase
        .from("call_to_action_urls")
        .select("*")
        .eq("call_to_action_id", cta.id);
        
      if (urlError) throw urlError;
      
      return {
        id: cta.id,
        clientBusinessId: cta.client_business_id,
        title: cta.title,
        description: cta.description,
        createdAt: cta.created_at,
        createdBy: cta.created_by,
        updatedAt: cta.updated_at,
        urls: urls.map(url => ({
          id: url.id,
          callToActionId: url.call_to_action_id,
          url: url.url,
          label: url.label,
        })),
        viewed: viewedIds.includes(cta.id),
      };
    }));
    
    return ctaWithUrls;
  } catch (error) {
    console.error("Error fetching call to actions with view status:", error);
    toast.error("Failed to fetch call to actions");
    return [];
  }
};

// Get client business IDs for a user
export const getUserClientBusinessIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("user_client_businesses")
      .select("client_business_id")
      .eq("user_id", userId);
      
    if (error) throw error;
    
    return data.map(item => item.client_business_id);
  } catch (error) {
    console.error("Error fetching user client businesses:", error);
    return [];
  }
};
