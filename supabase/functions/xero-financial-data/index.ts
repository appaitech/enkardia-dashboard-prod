
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const XERO_CLIENT_ID = Deno.env.get("XERO_CLIENT_ID")!;
const XERO_CLIENT_SECRET = Deno.env.get("XERO_CLIENT_SECRET")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface XeroToken {
  id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
}

interface XeroConnection {
  tenant_id: string;
  xero_token_id: string;
}

interface RequestBody {
  tenantId: string;
  reportType?: string;
  periodStart?: string;
  periodEnd?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    let body: RequestBody;
    
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request format: unable to parse request body");
    }
    
    const { tenantId, reportType = "ProfitAndLoss", periodStart, periodEnd } = body;
    
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    console.log(`Getting ${reportType} data for tenant: ${tenantId}`);
    
    // Get the Xero connection for this tenant
    const { data: connections, error: connectionError } = await supabase
      .from("xero_connections")
      .select("tenant_id, xero_token_id")
      .eq("tenant_id", tenantId)
      .limit(1);
    
    if (connectionError || !connections || connections.length === 0) {
      console.error("Error fetching Xero connection:", connectionError || "No connection found");
      throw new Error("No Xero connection found for this tenant");
    }
    
    const connection = connections[0] as XeroConnection;
    
    // Get the token associated with this connection
    const { data: token, error: tokenError } = await supabase
      .from("xero_tokens")
      .select("id, access_token, refresh_token, token_expiry")
      .eq("id", connection.xero_token_id)
      .single();
    
    if (tokenError || !token) {
      console.error("Error fetching Xero token:", tokenError || "No token found");
      throw new Error("No Xero token found for this connection");
    }
    
    const xeroToken = token as XeroToken;
    
    // Check if the token is expired
    const now = new Date();
    const tokenExpiry = new Date(xeroToken.token_expiry);
    
    let accessToken = xeroToken.access_token;
    
    // If token is expired, refresh it
    if (tokenExpiry <= now) {
      console.log("Token expired, refreshing...");
      
      const refreshResponse = await fetch("https://identity.xero.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: xeroToken.refresh_token,
        }),
      });
      
      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error("Failed to refresh token:", errorText);
        throw new Error("Failed to refresh Xero token");
      }
      
      const refreshData = await refreshResponse.json();
      
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
        .eq("id", xeroToken.id);
      
      if (updateError) {
        console.error("Error updating token:", updateError);
        throw new Error("Failed to update token in database");
      }
      
      accessToken = refreshData.access_token;
    }
    
    // Prepare the URL for the Xero API request
    let reportUrl = `https://api.xero.com/api.xro/2.0/Reports/${reportType}`;
    
    // Add date parameters if provided
    if (periodStart && periodEnd) {
      reportUrl += `?fromDate=${periodStart}&toDate=${periodEnd}`;
    }
    
    // Fetch the report from Xero
    const reportResponse = await fetch(reportUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Xero-Tenant-Id": tenantId,
      },
    });
    
    if (!reportResponse.ok) {
      const errorText = await reportResponse.text();
      console.error(`Error fetching ${reportType} from Xero:`, errorText);
      throw new Error(`Failed to fetch ${reportType} from Xero: ${reportResponse.status} ${reportResponse.statusText}`);
    }
    
    const reportData = await reportResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: reportData,
        reportType,
        tenantId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in Xero financial data function:", error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error" 
      }),
      { 
        status: error.status || 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
