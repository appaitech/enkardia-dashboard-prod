
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { isValidInvitationToken, getInvitationDetails } from "@/services/invitationService";
import { toast } from "sonner";
import SignupForm from "@/components/auth/SignupForm";

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState("");
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/user/dashboard");
      return;
    }
    
    const validateToken = async () => {
      if (!token) {
        setIsValid(false);
        setError("No invitation token provided");
        setValidating(false);
        return;
      }
      
      try {
        const isValidToken = await isValidInvitationToken(token);
        
        if (isValidToken) {
          const details = await getInvitationDetails(token);
          
          if (details && details.email) {
            setInvitationEmail(details.email);
            setIsValid(true);
          } else {
            setError("Invalid invitation details");
            setIsValid(false);
          }
        } else {
          setError("Invalid or expired invitation token");
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error validating invitation token:", error);
        setError("Error validating invitation");
        setIsValid(false);
      } finally {
        setValidating(false);
      }
    };
    
    validateToken();
  }, [token, isAuthenticated, user, navigate]);

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-600 px-6 py-12">
        <div className="w-full max-w-md text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-lg text-white">Validating invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-600 px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Enkardia</h1>
          <p className="text-lg text-blue-100/80">Elevate Your Business</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {isValid ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Account</h2>
              <p className="text-gray-600 mb-8">You've been invited to join Enkardia. Please complete your account setup.</p>
              <SignupForm invitationToken={token} invitationEmail={invitationEmail} />
            </>
          ) : (
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-red-600">Invalid Invitation</CardTitle>
                <CardDescription>
                  {error || "This invitation link is invalid or has expired"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <p className="text-gray-600 mb-6 text-center">
                  Please contact the administrator who sent you this invitation for assistance.
                </p>
                <Button onClick={() => navigate("/login")}>
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
