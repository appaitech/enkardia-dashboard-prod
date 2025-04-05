
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT to ensure the request is from an authenticated user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user: authenticatedUser }, error: verifyError } = await supabaseAdmin.auth.getUser(jwt);

    if (verifyError || !authenticatedUser) {
      console.error("JWT verification error:", verifyError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Authenticated user:", authenticatedUser.id);

    // Parse request body to get the userId
    const { userId } = await req.json();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the authenticated user has admin privileges
    const { data: adminCheck, error: roleCheckError } = await supabaseAdmin
      .from('profiles')
      .select('role, account_type')
      .eq('id', authenticatedUser.id)
      .single();

    if (roleCheckError) {
      console.error("Error checking admin role:", roleCheckError);
      return new Response(
        JSON.stringify({ error: 'Error verifying admin privileges' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminCheck || adminCheck.role !== 'ADMIN' || adminCheck.account_type !== 'CONSOLE') {
      console.log("Non-admin attempted deletion, role:", adminCheck?.role, "account type:", adminCheck?.account_type);
      return new Response(
        JSON.stringify({ error: 'Only administrators can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Don't allow users to delete themselves
    if (userId === authenticatedUser.id) {
      console.log("User attempted to delete themselves:", userId);
      return new Response(
        JSON.stringify({ error: 'You cannot delete your own account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if target user is a CONSOLE ADMIN (which cannot be deleted by other CONSOLE ADMINs)
    const { data: targetUserData, error: targetUserError } = await supabaseAdmin
      .from('profiles')
      .select('role, account_type')
      .eq('id', userId)
      .single();

    if (targetUserError) {
      console.error("Error checking target user:", targetUserError);
      return new Response(
        JSON.stringify({ error: 'Error checking target user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (targetUserData && targetUserData.role === 'ADMIN' && targetUserData.account_type === 'CONSOLE') {
      console.log("User attempted to delete another CONSOLE ADMIN user:", userId);
      return new Response(
        JSON.stringify({ error: 'CONSOLE ADMIN users cannot delete other CONSOLE ADMIN users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Attempting to delete user:", userId);

    // First, delete the user using the admin API which should cascade to the profile
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In case the profile wasn't deleted by the cascade, try to delete it explicitly
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (profileError) {
      console.error("Error deleting user profile:", profileError);
      // We don't want to fail the entire operation if just the profile deletion failed
      // The auth user has been deleted which is the main goal
      console.log("Auth user deleted successfully, but there was an issue with the profile deletion");
    }

    console.log("User deleted successfully:", userId);

    // Return a success response
    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
