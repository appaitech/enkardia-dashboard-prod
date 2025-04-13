
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

    // Parse request body to get the update details
    const { userId, updates } = await req.json();
    if (!userId || !updates) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or updates in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the authenticated user has appropriate privileges
    const { data: currentUserProfile, error: currentUserError } = await supabaseAdmin
      .from('profiles')
      .select('role, account_type')
      .eq('id', authenticatedUser.id)
      .single();

    if (currentUserError) {
      console.error("Error checking current user profile:", currentUserError);
      return new Response(
        JSON.stringify({ error: 'Error verifying user privileges' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the target user's profile
    const { data: targetUserProfile, error: targetUserError } = await supabaseAdmin
      .from('profiles')
      .select('role, account_type')
      .eq('id', userId)
      .single();

    if (targetUserError) {
      console.error("Error checking target user profile:", targetUserError);
      return new Response(
        JSON.stringify({ error: 'Error fetching target user details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Self-edit is always allowed
    const isEditingSelf = authenticatedUser.id === userId;

    // Check if current user is CONSOLE
    const isCurrentUserConsole = currentUserProfile.account_type === 'CONSOLE';
    
    // Check if current user is CONSOLE ADMIN
    const isCurrentUserConsoleAdmin = isCurrentUserConsole && currentUserProfile.role === 'ADMIN';
    
    // Check if target user is CLIENT
    const isTargetUserClient = targetUserProfile.account_type === 'CLIENT';
    
    // Check if target user is CONSOLE ADMIN
    const isTargetUserConsoleAdmin = targetUserProfile.account_type === 'CONSOLE' && targetUserProfile.role === 'ADMIN';
    
    // Determine permissions
    let canEdit = false;
    let canEditRole = false;
    let canEditAccountType = false;

    // Permission rules:
    // 1. Users can always edit themselves
    // 2. All CONSOLE users can edit CLIENT users
    // 3. Only CONSOLE ADMINs can edit account_type
    // 4. CONSOLE users cannot edit other CONSOLE users (unless they are ADMIN)
    
    if (isEditingSelf) {
      canEdit = true;
      canEditRole = isCurrentUserConsole; // CONSOLE users can edit their own role
      canEditAccountType = isCurrentUserConsoleAdmin; // Only CONSOLE ADMINs can edit their own account type
    } else if (isTargetUserClient && isCurrentUserConsole) {
      canEdit = true;
      canEditRole = true;
      canEditAccountType = isCurrentUserConsoleAdmin;
    } else if (isCurrentUserConsoleAdmin) {
      if (!isTargetUserConsoleAdmin) {
        canEdit = true;
        canEditRole = true;
        canEditAccountType = true;
      } else {
        // CONSOLE ADMINs cannot edit other CONSOLE ADMINs
        return new Response(
          JSON.stringify({ error: 'CONSOLE ADMIN users cannot modify other CONSOLE ADMIN users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // No permission
      return new Response(
        JSON.stringify({ error: 'You do not have permission to edit this user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter updates based on permissions
    const filteredUpdates = { ...updates };
    
    // Remove account_type if not allowed to edit it
    if (!canEditAccountType && 'account_type' in filteredUpdates) {
      delete filteredUpdates.account_type;
    }
    
    // Remove role if not allowed to edit it
    if (!canEditRole && 'role' in filteredUpdates) {
      delete filteredUpdates.role;
    }
    
    // If there are no valid updates left, return success without doing anything
    if (Object.keys(filteredUpdates).length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No changes applied', appliedUpdates: {} }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply the updates
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success response with the applied updates
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User updated successfully',
        appliedUpdates: filteredUpdates
      }),
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
