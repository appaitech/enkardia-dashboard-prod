
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { email, password, name, account_type, role } = await req.json();
    console.log("Creating user with details:", { email, name, account_type, role });
    
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Authorization header is missing");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Auth header present:", authHeader.substring(0, 20) + "...");

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase admin client for user creation
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create Supabase client with JWT token for authorization check
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    console.log("Attempting to get user from token...");

    // Verify the requesting user is authenticated by getting their information
    const { 
      data: { user: requestingUser },
      error: requestingUserError
    } = await supabaseClient.auth.getUser();

    console.log("Get user result:", requestingUser ? "Found" : "Not found", requestingUserError ? `Error: ${requestingUserError.message}` : "No error");

    if (requestingUserError || !requestingUser) {
      console.error("Error getting requesting user:", requestingUserError);
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized: User not found", 
          details: requestingUserError?.message || "No user found for the provided token" 
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User found, ID:", requestingUser.id);

    // Get the requesting user's profile
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("account_type, role")
      .eq("id", requestingUser.id)
      .single();

    console.log("Profile data:", profileData, "Profile error:", profileError ? profileError.message : "None");

    if (profileError || !profileData) {
      console.error("Error getting profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the requesting user is a CONSOLE ADMIN
    if (!(profileData.account_type === "CONSOLE" && profileData.role === "ADMIN")) {
      console.error("User is not authorized to create users:", profileData);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Only CONSOLE ADMIN users can create users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authorization successful, creating user...");

    // Create the user with the admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        account_type,
        role,
      }
    });

    if (error) {
      console.error("Error creating user:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User created successfully");
    return new Response(
      JSON.stringify({ data, success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
