
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AccountType, UserRole } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { acceptInvitation } from "@/services/invitationService";
import { toast } from "sonner";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Check if we're coming from an invitation
  const invitationToken = searchParams.get("token");
  const invitationEmail = searchParams.get("email");
  
  // Pre-fill the email if it's coming from an invitation
  React.useEffect(() => {
    if (invitationEmail) {
      setEmail(invitationEmail);
    }
  }, [invitationEmail]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
            toast.success("Account created and you've been added to the client business!");
          } else {
            console.warn("Failed to associate user with client business, but account was created");
            toast.warning("Account created, but there was an issue associating you with the client business.");
          }
        } catch (invitationError) {
          console.error("Error accepting invitation:", invitationError);
          toast.warning("Account created, but could not complete the invitation process.");
        }
      }
      
      // Reset loading state
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || "Signup failed");
      setIsLoading(false);
    }
  };

  // Reset loading state on mount
  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>
          {invitationToken ? 
            "Complete your account setup to accept the invitation" : 
            "Set up your new account to access the client portal"}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
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
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
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
        </CardContent>
      </form>
    </Card>
  );
};

export default SignupForm;
