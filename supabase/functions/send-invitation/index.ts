
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get environment variables - will come from either local config or Supabase secrets
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:8080";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

if (!RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set. Email sending will be simulated.");
}

// Initialize Resend client if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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
    
    const invitationLink = `${APP_URL}/accept-invitation?token=${token}`;
    
    let emailResult = null;

    // If Resend is configured, send a real email
    if (resend) {
      try {
        emailResult = await resend.emails.send({
          from: "Invitations <onboarding@resend.dev>",
          to: [email],
          subject: `You're invited to join ${businessName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4F46E5;">You're invited!</h1>
              <p>You've been invited to join <strong>${businessName}</strong> on our platform.</p>
              <p>Click the button below to accept this invitation and set up your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #6B7280; font-size: 14px;">If you didn't expect this invitation, you can ignore this email.</p>
              <p style="color: #6B7280; font-size: 14px;">This invitation link will expire in 7 days.</p>
            </div>
          `,
        });
        
        console.log("Email sent successfully via Resend:", emailResult);
      } catch (emailError) {
        console.error("Error sending email via Resend:", emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }
    } else {
      // Simulate email sending for local development without API key
      console.log("Simulating email sending (RESEND_API_KEY not configured)");
      console.log(`Invitation link: ${invitationLink}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation email sent to ${email}`,
        debug: { 
          invitationLink,
          emailSent: !!resend,
          emailResult: emailResult || "simulated"
        }
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
