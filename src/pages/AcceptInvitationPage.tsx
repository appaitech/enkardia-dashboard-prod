
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Mail, Lock } from "lucide-react";
import { isValidInvitationToken, acceptInvitation, getInvitationDetails } from "@/services/invitationService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, signup, login } = useAuth();
  
  const [status, setStatus] = useState<"checking" | "invalid" | "valid" | "accepted" | "error" | "createAccount">("checking");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  });
  
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus("invalid");
        setErrorMessage("No invitation token provided");
        return;
      }
      
      try {
        console.log("Validating token:", token);
        const isValid = await isValidInvitationToken(token);
        
        if (isValid) {
          console.log("Token is valid, fetching invitation details");
          const details = await getInvitationDetails(token);
          
          if (details && details.email) {
            console.log("Invitation details found for email:", details.email);
            setInvitationEmail(details.email);
            form.setValue("email", details.email);
            
            if (isAuthenticated && user && user.email === details.email) {
              console.log("User already authenticated with matching email");
              setStatus("valid");
            } else {
              console.log("Checking if user exists with email:", details.email);
              const { userExists } = await checkUserExists(details.email);
              
              if (userExists) {
                console.log("User exists, showing login form");
                setStatus("valid");
              } else {
                console.log("User does not exist, showing account creation form");
                setStatus("createAccount");
              }
            }
          } else {
            console.error("Failed to get invitation details", details);
            setStatus("error");
            setErrorMessage("Failed to retrieve invitation details");
          }
        } else {
          console.error("Invalid invitation token");
          setStatus("invalid");
          setErrorMessage("This invitation link is invalid or has expired");
        }
      } catch (error) {
        console.error("Error validating invitation token:", error);
        setStatus("error");
        setErrorMessage("An unexpected error occurred while processing your invitation");
      }
    };
    
    if (!authLoading) {
      validateToken();
    }
  }, [token, authLoading, isAuthenticated, user, form]);
  
  const checkUserExists = async (email: string) => {
    try {
      console.log("Checking if user exists:", email);
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      
      const userExists = !error || (error.message?.includes('Email not confirmed'));
      console.log("User exists check result:", userExists, error?.message);
      
      return { userExists };
    } catch (error) {
      console.error("Error checking if user exists:", error);
      return { userExists: false };
    }
  };
  
  const handleAcceptInvitation = async () => {
    if (!user || !token) return;
    
    setIsProcessing(true);
    
    try {
      console.log("Accepting invitation for user:", user.id);
      const success = await acceptInvitation(token, user.id);
      
      if (success) {
        setStatus("accepted");
        toast.success("You have been added to the client business");
        setTimeout(() => {
          navigate("/user/dashboard");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage("Failed to accept invitation");
        toast.error("Failed to accept invitation");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setStatus("error");
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCreateAccount = async (data: PasswordFormValues) => {
    if (!token) return;
    
    setIsProcessing(true);
    
    try {
      console.log("Creating new account for:", data.email);
      await signup(data.email, data.password, data.email.split('@')[0], "CLIENT", "STANDARD");
      
      toast.success("Account created successfully");
      console.log("Logging in with new account");
      
      await login(data.email, data.password);
      
      navigate(`/accept-invitation?token=${token}`);
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error(error.message || "Failed to create account");
      setErrorMessage(error.message || "Failed to create account");
      setIsProcessing(false);
    }
  };
  
  const handleLogin = async (data: PasswordFormValues) => {
    if (!token) return;
    
    setIsProcessing(true);
    
    try {
      console.log("Logging in with existing account:", data.email);
      await login(data.email, data.password);
      toast.success("Login successful");
      
      navigate(`/accept-invitation?token=${token}`);
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error(error.message || "Failed to log in");
      setErrorMessage(error.message || "Failed to log in");
      setIsProcessing(false);
    }
  };
  
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
          <p className="text-slate-600 mb-4">{errorMessage || "This invitation link is invalid or has expired."}</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      );
    }
    
    if (status === "error") {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-slate-600 mb-4">{errorMessage || "We couldn't process your invitation. Please try again later."}</p>
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
    
    if (status === "createAccount") {
      return (
        <div className="text-center">
          <p className="mb-6">Create an account to accept this invitation.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateAccount)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input 
                          {...field} 
                          className="pl-10" 
                          disabled={true} 
                          readOnly
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          className="pl-10" 
                          placeholder="Set a password"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          className="pl-10" 
                          placeholder="Confirm password"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Accept'
                )}
              </Button>
            </form>
          </Form>
        </div>
      );
    }
    
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
            <p className="mb-6">Please log in to accept this invitation.</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <FormControl>
                          <Input 
                            {...field} 
                            className="pl-10" 
                            disabled={!!invitationEmail} 
                            readOnly={!!invitationEmail}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password" 
                            className="pl-10" 
                            placeholder="Enter your password"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log In & Accept'
                  )}
                </Button>
              </form>
            </Form>
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
