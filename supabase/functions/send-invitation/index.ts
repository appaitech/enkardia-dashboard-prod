
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = Deno.env.get("APP_URL") || "http://localhost:8080";

interface InvitationRequest {
  email: string;
  businessName: string;
  token: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { email, businessName, token }: InvitationRequest = await req.json();
    
    if (!email || !businessName || !token) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: email, businessName, and token are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Sending invitation email to ${email} for business ${businessName}`);
    
    // In a real implementation, send an email using a service like Resend, SendGrid, etc.
    // For now, we'll simulate sending an email
    const invitationLink = `${APP_URL}/accept-invitation?token=${token}`;
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Invitation link: ${invitationLink}`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation email sent to ${email}`,
        debug: { invitationLink }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
