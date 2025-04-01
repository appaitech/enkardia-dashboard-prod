
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT to ensure the request is from an authenticated user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user: authenticatedUser }, error: verifyError } = await supabaseAdmin.auth.getUser(jwt);

    if (verifyError || !authenticatedUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the authenticated user has admin privileges
    const { data: adminCheck } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', authenticatedUser.id)
      .single();

    if (!adminCheck || adminCheck.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Only administrators can delete users' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body to get the userId
    const { userId } = await req.json();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the user using the admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return a success response
    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});
