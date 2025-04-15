
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { acceptInvitation } from "@/services/invitationService";
import { toast } from "sonner";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const invitationToken = searchParams.get("invitation_token");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          // No session found, redirect to login
          navigate("/login");
          return;
        }

        // Process invitation if there's a token
        if (invitationToken && session.user) {
          try {
            const success = await acceptInvitation(invitationToken, session.user.id);
            
            if (success) {
              toast.success("Successfully joined the organization!");
            } else {
              toast.error("Failed to process invitation");
            }
          } catch (inviteError) {
            console.error("Invitation error:", inviteError);
            toast.error("Error processing invitation");
          }
        }

        // Check auth provider and user metadata
        const provider = session.user?.app_metadata?.provider;
        const accountType = session.user?.user_metadata?.account_type || "CLIENT";
        
        // Navigate based on account type
        if (accountType === "CONSOLE") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message || "Authentication error");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate, invitationToken]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 to-navy-600 px-6 py-12">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Completing authentication...</h2>
        <p className="text-blue-100">Please wait while we finish setting up your account.</p>
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 text-white rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
