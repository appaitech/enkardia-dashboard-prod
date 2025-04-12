
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const XERO_CLIENT_ID = Deno.env.get("XERO_CLIENT_ID")!;
const XERO_CLIENT_SECRET = Deno.env.get("XERO_CLIENT_SECRET")!;
const XERO_AUTHORIZE_REDIRECT_URL = Deno.env.get("XERO_AUTHORIZE_REDIRECT_URL")!;
const XERO_AUTHORIZE_SCOPE = Deno.env.get("XERO_AUTHORIZE_SCOPE")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Get action from either URL query parameter or request body
    let action = url.searchParams.get("action");
    let requestData;
    
    // If action not found in URL params, try to get it from the request body
    if (!action && req.method === "POST") {
      try {
        requestData = await req.json();
        action = requestData.action;
      } catch (error) {
        console.error("Error parsing request body:", error);
      }
    }
    
    console.log("Action requested:", action);

    // Get authorization URL for Xero
    if (action === "authorize") {
      const state = crypto.randomUUID();
      const authorizeUrl = new URL("https://login.xero.com/identity/connect/authorize");
      
      authorizeUrl.searchParams.append("response_type", "code");
      authorizeUrl.searchParams.append("client_id", XERO_CLIENT_ID);
      authorizeUrl.searchParams.append("redirect_uri", XERO_AUTHORIZE_REDIRECT_URL);
      authorizeUrl.searchParams.append("scope", XERO_AUTHORIZE_SCOPE);
      authorizeUrl.searchParams.append("state", state);
      
      return new Response(
        JSON.stringify({ url: authorizeUrl.toString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle callback from Xero with auth code
    if (action === "callback") {
      // Only parse the request body if not already parsed
      if (!requestData) {
        try {
          requestData = await req.json();
        } catch (error) {
          console.error("Error parsing request body in callback:", error);
          throw new Error("Failed to parse request body");
        }
      }
      
      const { code, state } = requestData;
      
      if (!code) {
        throw new Error("Authorization code is required");
      }

      // Exchange code for token
      const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: XERO_AUTHORIZE_REDIRECT_URL,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange failed:", errorData);
        throw new Error(`Failed to exchange token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      console.log("Token received:", JSON.stringify(tokenData));

      // Calculate token expiry time
      const expiresIn = tokenData.expires_in;
      const tokenExpiry = new Date();
      tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn);

      // Get user information from id_token if available
      let userName = "Xero User";
      let xeroUserId = null;
      if (tokenData.id_token) {
        try {
          // Extract user info from id_token (JWT)
          const base64Url = tokenData.id_token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          xeroUserId = payload.xero_userid || payload.sub;
          
          if (payload.email) {
            userName = payload.email;
          } else if (payload.preferred_username) {
            userName = payload.preferred_username;
          } else if (payload.name) {
            userName = payload.name;
          }
        } catch (error) {
          console.error("Error parsing id_token:", error);
        }
      }

      // Check if we already have a token for this Xero user
      let existingToken = null;
      if (xeroUserId) {
        const { data: existingTokens, error: fetchError } = await supabase
          .from("xero_tokens")
          .select("*")
          .eq("xero_userid", xeroUserId)
          .limit(1);
          
        if (fetchError) {
          console.error("Error fetching existing token:", fetchError);
        } else if (existingTokens && existingTokens.length > 0) {
          existingToken = existingTokens[0];
        }
      }

      let tokenRecord;
      
      if (existingToken) {
        // Update existing token
        console.log(`Updating existing token for Xero user: ${userName} (${xeroUserId})`);
        
        const { data: updatedToken, error: updateError } = await supabase
          .from("xero_tokens")
          .update({
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type,
            refresh_token: tokenData.refresh_token,
            scope: tokenData.scope,
            id_token: tokenData.id_token,
            token_expiry: tokenExpiry.toISOString(),
            updated_at: new Date().toISOString(),
            user_name: userName,
            authentication_event_id: state // Update with the new auth event
          })
          .eq("id", existingToken.id)
          .select("id")
          .single();

        if (updateError) {
          console.error("Error updating token:", updateError);
          throw new Error(`Failed to update token: ${updateError.message}`);
        }
        
        tokenRecord = updatedToken;
      } else {
        // Create a new token record
        console.log(`Creating new token for Xero user: ${userName} (${xeroUserId})`);
        
        const { data: newToken, error: tokenError } = await supabase
          .from("xero_tokens")
          .insert({
            authentication_event_id: state,
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type,
            refresh_token: tokenData.refresh_token,
            scope: tokenData.scope,
            id_token: tokenData.id_token,
            token_expiry: tokenExpiry.toISOString(),
            user_name: userName,
            xero_userid: xeroUserId,
            client_id: XERO_CLIENT_ID
          })
          .select("id")
          .single();

        if (tokenError) {
          console.error("Error storing token:", tokenError);
          throw new Error(`Failed to store token: ${tokenError.message}`);
        }
        
        tokenRecord = newToken;
      }

      // Get connections from Xero
      const connectionsResponse = await fetch("https://api.xero.com/connections", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!connectionsResponse.ok) {
        console.error("Error fetching connections:", await connectionsResponse.text());
        throw new Error(`Failed to fetch Xero connections: ${connectionsResponse.status}`);
      }

      const connections = await connectionsResponse.json();
      console.log("Connections:", JSON.stringify(connections));

      // Store connections in database
      for (const connection of connections) {
        // Store connections in the xero_connections table
        console.log(`Processing connection: ${connection.tenantId} (${connection.tenantName})`);
        
        try {
          // First, try inserting the connection
          const { error: connectionError } = await supabase
            .from("xero_connections")
            .insert({
              xero_id: connection.id,
              tenant_id: connection.tenantId,
              tenant_type: connection.tenantType,
              tenant_name: connection.tenantName,
              created_date_utc: connection.createdDateUtc,
              updated_date_utc: connection.updatedDateUtc,
              updated_at: new Date().toISOString(),
              xero_token_id: tokenRecord.id  // Link connection to token
            });

          if (connectionError) {
            // If insert fails due to unique constraint violation, try updating instead
            if (connectionError.code === "23505") { // Unique violation code
              console.log(`Connection ${connection.id} already exists, updating...`);
              
              const { error: updateError } = await supabase
                .from("xero_connections")
                .update({
                  tenant_id: connection.tenantId,
                  tenant_type: connection.tenantType,
                  tenant_name: connection.tenantName,
                  updated_date_utc: connection.updatedDateUtc,
                  updated_at: new Date().toISOString(),
                  xero_token_id: tokenRecord.id
                })
                .eq("xero_id", connection.id);
                
              if (updateError) {
                console.error(`Error updating Xero connection for tenant ${connection.tenantId}:`, updateError);
              }
            } else {
              console.error(`Error storing Xero connection for tenant ${connection.tenantId}:`, connectionError);
            }
          }
        } catch (error) {
          console.error(`Error processing Xero connection for tenant ${connection.tenantId}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Xero authentication successful", 
          tokenId: tokenRecord.id,
          connections 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get connections from Xero using a specific token or the latest token
    if (action === "get-connections") {
      console.log("Fetching Xero connections");
      
      // Parse request body if not already parsed
      if (!requestData) {
        try {
          requestData = await req.json();
        } catch (error) {
          console.error("Error parsing request body:", error);
        }
      }
      
      // Use specified token ID or get the latest token
      const tokenId = requestData?.tokenId;
      let tokenQuery = supabase
        .from("xero_tokens")
        .select("*");
        
      if (tokenId) {
        tokenQuery = tokenQuery.eq("id", tokenId);
      } else {
        tokenQuery = tokenQuery.order('created_at', { ascending: false });
      }
      
      tokenQuery = tokenQuery.limit(1);
      
      const { data: token, error: tokenError } = await tokenQuery.single();
      
      if (tokenError) {
        console.error("Error fetching token:", tokenError);
        throw new Error("No Xero token found. Please connect to Xero first.");
      }
      
      console.log("Found token, checking expiry:", token.token_expiry);
      
      // Check if the token is expired
      const now = new Date();
      const tokenExpiry = new Date(token.token_expiry);
      let accessToken = token.access_token;
      
      // If token is expired, refresh it
      if (tokenExpiry <= now) {
        console.log("Token expired, refreshing...");
        
        // Refresh the token
        const refreshResponse = await fetch("https://identity.xero.com/connect/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`)}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          }),
        });
        
        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.text();
          console.error("Token refresh failed:", errorData);
          throw new Error("Failed to refresh Xero token. Please reconnect to Xero.");
        }
        
        const refreshData = await refreshResponse.json();
        console.log("Token refreshed:", JSON.stringify(refreshData));
        
        // Calculate new token expiry time
        const expiresIn = refreshData.expires_in;
        const newTokenExpiry = new Date();
        newTokenExpiry.setSeconds(newTokenExpiry.getSeconds() + expiresIn);
        
        // Update the token in the database
        const { error: updateError } = await supabase
          .from("xero_tokens")
          .update({
            access_token: refreshData.access_token,
            expires_in: refreshData.expires_in,
            token_type: refreshData.token_type,
            refresh_token: refreshData.refresh_token,
            scope: refreshData.scope,
            id_token: refreshData.id_token,
            token_expiry: newTokenExpiry.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", token.id);
        
        if (updateError) {
          console.error("Error updating token:", updateError);
          throw new Error("Failed to update token in database");
        }
        
        accessToken = refreshData.access_token;
      }
      
      // Get connections from Xero
      const connectionsResponse = await fetch("https://api.xero.com/connections", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!connectionsResponse.ok) {
        console.error("Error fetching connections:", await connectionsResponse.text());
        throw new Error(`Failed to fetch Xero connections: ${connectionsResponse.status}`);
      }
      
      const connections = await connectionsResponse.json();
      console.log("Connections:", JSON.stringify(connections));
      
      // Store connections in database
      for (const connection of connections) {
        // Store connections in the xero_connections table
        console.log(`Processing connection: ${connection.tenantId} (${connection.tenantName})`);
        
        try {
          // First, try inserting the connection
          const { error: connectionError } = await supabase
            .from("xero_connections")
            .insert({
              xero_id: connection.id,
              tenant_id: connection.tenantId,
              tenant_type: connection.tenantType,
              tenant_name: connection.tenantName,
              created_date_utc: connection.createdDateUtc,
              updated_date_utc: connection.updatedDateUtc,
              updated_at: new Date().toISOString(),
              xero_token_id: token.id  // Link connection to token
            });

          if (connectionError) {
            // If insert fails due to unique constraint violation, try updating instead
            if (connectionError.code === "23505") { // Unique violation code
              console.log(`Connection ${connection.id} already exists, updating...`);
              
              const { error: updateError } = await supabase
                .from("xero_connections")
                .update({
                  tenant_id: connection.tenantId,
                  tenant_type: connection.tenantType,
                  tenant_name: connection.tenantName,
                  updated_date_utc: connection.updatedDateUtc,
                  updated_at: new Date().toISOString(),
                  xero_token_id: token.id
                })
                .eq("xero_id", connection.id);
                
              if (updateError) {
                console.error(`Error updating Xero connection for tenant ${connection.tenantId}:`, updateError);
              }
            } else {
              console.error(`Error storing Xero connection for tenant ${connection.tenantId}:`, connectionError);
            }
          }
        } catch (error) {
          console.error(`Error processing Xero connection for tenant ${connection.tenantId}:`, error);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Xero connections fetched successfully", 
          connections,
          tokenId: token.id,
          userName: token.user_name
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get all token records
    if (action === "get-tokens") {
      const { data: tokens, error: tokensError } = await supabase
        .from("xero_tokens")
        .select("id, user_name, created_at, updated_at, token_expiry")
        .order('created_at', { ascending: false });
      
      if (tokensError) {
        console.error("Error fetching tokens:", tokensError);
        throw new Error("Failed to fetch Xero tokens");
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          tokens
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Xero auth error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
