
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { acceptInvitation } from "@/services/invitationService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SignupFormProps {
  invitationToken?: string | null;
  invitationEmail?: string | null;
}

const SignupForm: React.FC<SignupFormProps> = ({ invitationToken, invitationEmail }) => {
  const [email, setEmail] = useState(invitationEmail || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    setIsLoading(true);
    
    if (!email || !password || !name) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }
    
    try {
      // Create user account with default account type "CLIENT" and role "STANDARD"
      const userId = await signup(email, password, name, "CLIENT", "STANDARD");

      // If we have an invitation token, accept it to associate user with client business
      if (invitationToken && userId) {
        console.log("Accepting invitation for new user:", userId, "with token:", invitationToken);
        try {
          const success = await acceptInvitation(invitationToken, userId);
          
          if (success) {
            console.log("Successfully associated user with client business");
            toast.success("Account created successfully!");
            
            // Attempt to log in the user with the newly created credentials
            try {
              await login(email, password);
              // Navigate to dashboard directly
              navigate("/user/dashboard");
            } catch (loginError) {
              console.error("Auto-login failed:", loginError);
              navigate("/login");
            }
          } else {
            console.warn("Failed to associate user with client business, but account was created");
            navigate('/error', {
              state: {
                title: "Partial Success",
                message: "Your account was created, but there was an issue associating you with the client business."
              }
            });
          }
        } catch (invitationError) {
          console.error("Error accepting invitation:", invitationError);
          navigate('/error', {
            state: {
              title: "Invitation Error",
              message: "Your account was created, but there was an issue with the invitation process."
            }
          });
        }
      } else {
        // No invitation token, just navigate to dashboard after login
        try {
          await login(email, password);
          // Navigate to dashboard directly
          navigate("/user/dashboard");
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
          navigate("/login");
        }
      }
      
    } catch (error: any) {
      setError(error.message || "Signup failed");
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setIsGoogleLoading(true);
    
    try {
      // If we have an invitation token, pass it as a query parameter
      const queryParams = invitationToken ? 
        `?invitation_token=${encodeURIComponent(invitationToken)}` : '';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${queryParams}`,
          queryParams: {
            // Can pass additional params to Google if needed
            // prompt: 'consent',
          }
        },
      });
      
      if (error) {
        throw error;
      }
      
      // User will be redirected to Google
    } catch (error: any) {
      console.error("Google signup error:", error);
      setError(error.message || "Google signup failed");
      setIsGoogleLoading(false);
    }
  };

  // Reset loading state on mount
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="space-y-4 p-0">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              id="signup-name"
              type="text" 
              placeholder="John Doe" 
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              id="signup-email"
              type="email" 
              placeholder="name@example.com" 
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!invitationEmail}
              readOnly={!!invitationEmail}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              id="signup-password"
              type="password" 
              placeholder="••••••••" 
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSignup();
                }
              }}
            />
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
            onClick={handleSignup}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>

        <div className="relative flex items-center justify-center mt-4">
          <div className="border-t border-gray-200 flex-grow"></div>
          <div className="mx-4 text-gray-500 text-sm">or</div>
          <div className="border-t border-gray-200 flex-grow"></div>
        </div>

        <div>
          <Button 
            type="button" 
            variant="outline"
            className="w-full border-gray-300 rounded-lg text-base font-medium flex items-center justify-center space-x-2"
            disabled={isGoogleLoading}
            onClick={handleGoogleSignup}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> 
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                <span>Sign up with Google</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
