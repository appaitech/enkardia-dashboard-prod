
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

      // Check if any token exists in the table by querying the first record
      const { data: existingTokens, error: queryError } = await supabase
        .from("xero_tokens")
        .select("id")
        .limit(1);

      if (queryError) {
        console.error("Error checking for existing tokens:", queryError);
      }

      let tokenRecord;
      let tokenError;

      // If any token exists, update it instead of inserting a new one
      if (existingTokens && existingTokens.length > 0) {
        console.log("Updating existing token");
        const firstTokenId = existingTokens[0].id;
        
        // Update the first token
        const { data, error } = await supabase
          .from("xero_tokens")
          .update({
            authentication_event_id: state,
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type,
            refresh_token: tokenData.refresh_token,
            scope: tokenData.scope,
            id_token: tokenData.id_token,
            token_expiry: tokenExpiry.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", firstTokenId)
          .select("id")
          .single();
          
        tokenRecord = data;
        tokenError = error;
      } else {
        // Otherwise insert a new token
        console.log("Creating new token");
        const { data, error } = await supabase
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
          })
          .select("id")
          .single();
          
        tokenRecord = data;
        tokenError = error;
      }

      if (tokenError) {
        console.error("Error storing token:", tokenError);
        throw new Error(`Failed to store token: ${tokenError.message}`);
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
        const { error: updateError } = await supabase
          .from("client_businesses")
          .update({ 
            xero_connected: true,
            updated_at: new Date().toISOString()
          })
          .eq("tenantId", connection.tenantId);

        if (updateError) {
          console.error(`Error updating client business for tenant ${connection.tenantId}:`, updateError);
        }
        
        // Store connections in the xero_connections table
        const { error: connectionError } = await supabase
          .from("xero_connections")
          .upsert({
            xero_id: connection.id,
            tenant_id: connection.tenantId,
            tenant_type: connection.tenantType,
            tenant_name: connection.tenantName,
            created_date_utc: connection.createdDateUtc,
            updated_date_utc: connection.updatedDateUtc,
            updated_at: new Date().toISOString()
          }, { onConflict: 'tenant_id' });

        if (connectionError) {
          console.error(`Error storing Xero connection for tenant ${connection.tenantId}:`, connectionError);
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
    
    // Get connections from Xero using the current token
    if (action === "get-connections") {
      console.log("Fetching Xero connections");
      
      // Get the first token from the database
      const { data: token, error: tokenError } = await supabase
        .from("xero_tokens")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
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
        const { error: connectionError } = await supabase
          .from("xero_connections")
          .upsert({
            xero_id: connection.id,
            tenant_id: connection.tenantId,
            tenant_type: connection.tenantType,
            tenant_name: connection.tenantName,
            created_date_utc: connection.createdDateUtc,
            updated_date_utc: connection.updatedDateUtc,
            updated_at: new Date().toISOString()
          }, { onConflict: 'tenant_id' });
          
        if (connectionError) {
          console.error(`Error storing Xero connection for tenant ${connection.tenantId}:`, connectionError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Xero connections fetched successfully", 
          connections 
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
