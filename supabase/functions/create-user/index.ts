
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
    console.log("Auth header received:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Invalid authorization header format:", authHeader);
      return new Response(
        JSON.stringify({ error: "Invalid authorization format", details: "Authorization header must be Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace("Bearer ", "");
    console.log("Extracted token (first 10 chars):", token.substring(0, 10) + "...");
    
    // Create Supabase admin client for user creation
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
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
            Authorization: `Bearer ${token}`,
          },
        }
      }
    );

    console.log("Attempting to get user from session token...");
    
    try {
      // Verify the requesting user is authenticated by getting their information
      const { data, error } = await supabaseClient.auth.getUser(token);
      
      if (error || !data.user) {
        console.error("Error getting user from token:", error?.message || "No user returned");
        return new Response(
          JSON.stringify({ 
            error: "Unauthorized: User not found", 
            details: error?.message || "Auth session missing!"
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const requestingUser = data.user;
      console.log("User found with ID:", requestingUser.id);

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
      const createUserResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
          account_type,
          role,
        }
      });

      if (createUserResult.error) {
        console.error("Error creating user:", createUserResult.error);
        return new Response(
          JSON.stringify({ error: createUserResult.error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("User created successfully with ID:", createUserResult.data.user.id);
      return new Response(
        JSON.stringify({ data: createUserResult.data, success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (innerError) {
      console.error("Error in authentication process:", innerError);
      return new Response(
        JSON.stringify({ 
          error: "Authentication error", 
          details: innerError.message || "Failed to authenticate user from token"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
