
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { isValidInvitationToken, acceptInvitation } from "@/services/invitationService";
import { toast } from "sonner";

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<"checking" | "invalid" | "valid" | "accepted" | "error">("checking");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if the token is valid
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }
      
      try {
        const isValid = await isValidInvitationToken(token);
        setStatus(isValid ? "valid" : "invalid");
      } catch (error) {
        console.error("Error validating invitation token:", error);
        setStatus("error");
      }
    };
    
    validateToken();
  }, [token]);
  
  const handleAcceptInvitation = async () => {
    if (!user || !token) return;
    
    setIsProcessing(true);
    
    try {
      const success = await acceptInvitation(token, user.id);
      
      if (success) {
        setStatus("accepted");
        toast.success("You have been added to the client business");
        setTimeout(() => {
          navigate("/user/dashboard");
        }, 2000);
      } else {
        setStatus("error");
        toast.error("Failed to accept invitation");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGoToLogin = () => {
    navigate(`/login?invitation=${token}`);
  };
  
  // Render appropriate content based on status
  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-600">Checking authentication status...</p>
        </div>
      );
    }
    
    if (status === "checking") {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-600">Verifying your invitation...</p>
        </div>
      );
    }
    
    if (status === "invalid") {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Invalid Invitation</h3>
          <p className="text-slate-600 mb-4">This invitation link is invalid or has expired.</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      );
    }
    
    if (status === "error") {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-slate-600 mb-4">We couldn't process your invitation. Please try again later.</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      );
    }
    
    if (status === "accepted") {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Invitation Accepted!</h3>
          <p className="text-slate-600 mb-4">You've been successfully added to the client business.</p>
          <p className="text-slate-500 text-sm mb-4">Redirecting to your dashboard...</p>
        </div>
      );
    }
    
    // Valid invitation, show accept button or login prompt
    return (
      <div className="text-center">
        {isAuthenticated ? (
          <div>
            <p className="mb-6">Click the button below to accept this invitation and join the client business.</p>
            <Button 
              onClick={handleAcceptInvitation} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </div>
        ) : (
          <div>
            <p className="mb-6">Please log in or sign up to accept this invitation.</p>
            <Button onClick={handleGoToLogin} className="w-full">
              Log In or Sign Up
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">Client Business Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a client business
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderContent()}
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <div className="text-sm text-center w-full text-slate-500">
            <p>If you have any questions, please contact the administrator</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AcceptInvitationPage;
