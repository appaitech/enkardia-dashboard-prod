import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Mail, Lock, User } from "lucide-react";
import { isValidInvitationToken, acceptInvitation, getInvitationDetails } from "@/services/invitationService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
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
  
  const [status, setStatus] = useState<"checking" | "valid" | "accepted" | "createAccount">("checking");
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState<string>("");
  const [clientBusinessId, setClientBusinessId] = useState<string>("");
  const [initialValidationComplete, setInitialValidationComplete] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });
  
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        navigate('/error', { 
          state: { 
            title: "Invalid Invitation", 
            message: "No invitation token provided" 
          }
        });
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
            setEmail(details.email);
            setClientBusinessId(details.clientBusinessId);
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
            navigate('/error', { 
              state: { 
                title: "Invalid Invitation", 
                message: "This invitation link is no longer valid. It may have expired or already been accepted." 
              }
            });
          }
        } else {
          console.error("Invalid invitation token");
          navigate('/error', { 
            state: { 
              title: "Invalid Invitation", 
              message: "This invitation link is invalid or has expired" 
            }
          });
        }
      } catch (error) {
        console.error("Error validating invitation token:", error);
        navigate('/error', { 
          state: { 
            title: "Error Processing Invitation", 
            message: "An unexpected error occurred while processing your invitation" 
          }
        });
      } finally {
        setInitialValidationComplete(true);
      }
    };
    
    if (!authLoading && !initialValidationComplete && !isCreatingAccount) {
      validateToken();
    }
  }, [token, authLoading, isAuthenticated, user, form, navigate, initialValidationComplete, isCreatingAccount]);
  
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
  
  const validateCreateAccountForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!name || name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateLoginForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!password) {
      errors.password = "Password is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAcceptInvitation = async () => {
    if (!user || !token) return;
    
    setIsProcessing(true);
    
    try {
      console.log("Accepting invitation for user:", user.id, "with token:", token);
      const success = await acceptInvitation(token, user.id);
      
      if (success) {
        setStatus("accepted");
        toast.success("You have been added to the client business");
        setTimeout(() => {
          navigate("/user/dashboard");
        }, 2000);
      } else {
        navigate('/error', { 
          state: { 
            title: "Invitation Error", 
            message: "Failed to accept invitation. Please try again or contact support." 
          }
        });
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      navigate('/error', { 
        state: { 
          title: "Error Processing Invitation", 
          message: "An unexpected error occurred. Please try again or contact support." 
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    
    if (!validateCreateAccountForm()) {
      setIsCreatingAccount(false);
      return;
    }
    
    if (!token || !clientBusinessId) {
      console.error("Missing token or clientBusinessId");
      navigate('/error', { 
        state: { 
          title: "Invalid Request", 
          message: "Missing required information for account creation." 
        }
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log("Creating new account for:", email);
      const userId = await signup(email, password, name, "CLIENT", "STANDARD");
      
      if (userId) {
        console.log("User account created with ID:", userId);
        
        try {
          console.log("Accepting invitation for new user:", userId, "with token:", token);
          const success = await acceptInvitation(token, userId);
          
          if (success) {
            console.log("Successfully accepted invitation and associated user with client business");
            setStatus("accepted");
            toast.success("Account created and you've been added to the client business");
            
            await login(email, password);
            
            setTimeout(() => {
              navigate("/user/dashboard");
            }, 2000);
          } else {
            navigate('/error', { 
              state: { 
                title: "Error Accepting Invitation", 
                message: "Your account was created, but there was an issue associating you with the client business. Please contact support." 
              }
            });
          }
        } catch (invitationError: any) {
          console.error("Error accepting invitation:", invitationError);
          navigate('/error', { 
            state: { 
              title: "Error Accepting Invitation", 
              message: "Your account was created, but there was an issue with the invitation process. Please contact support." 
            }
          });
        }
      } else {
        throw new Error("Failed to create account");
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      navigate('/error', { 
        state: { 
          title: "Account Creation Failed", 
          message: error.message || "There was an error creating your account. Please try again." 
        }
      });
    } finally {
      setIsProcessing(false);
      setIsCreatingAccount(false);
    }
  };
  
  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }
    
    if (!token) return;
    
    setIsProcessing(true);
    
    try {
      console.log("Logging in with existing account:", email);
      await login(email, password);
      toast.success("Login successful");
      
      navigate(`/accept-invitation?token=${token}`);
    } catch (error: any) {
      console.error("Error logging in:", error);
      navigate('/error', { 
        state: { 
          title: "Login Failed", 
          message: error.message || "Failed to log in. Please check your credentials and try again." 
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const renderContent = () => {
    if (authLoading || status === "checking") {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-600">
            {authLoading ? "Checking authentication status..." : "Verifying your invitation..."}
          </p>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10" 
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
              {formErrors.name && <p className="text-sm font-medium text-destructive">{formErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  id="email"
                  value={email}
                  className="pl-10" 
                  disabled={true} 
                  readOnly
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10" 
                  placeholder="Set a password"
                />
              </div>
              {formErrors.password && <p className="text-sm font-medium text-destructive">{formErrors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  id="confirmPassword"
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10" 
                  placeholder="Confirm password"
                />
              </div>
              {formErrors.confirmPassword && <p className="text-sm font-medium text-destructive">{formErrors.confirmPassword}</p>}
            </div>
            
            <Button 
              type="button" 
              className="w-full"
              disabled={isProcessing}
              onClick={handleCreateAccount}
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
          </div>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="login-email"
                    value={email}
                    className="pl-10" 
                    disabled={!!invitationEmail} 
                    readOnly={!!invitationEmail}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="login-password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10" 
                    placeholder="Enter your password"
                  />
                </div>
                {formErrors.password && <p className="text-sm font-medium text-destructive">{formErrors.password}</p>}
              </div>
              
              <Button 
                type="button" 
                className="w-full"
                disabled={isProcessing}
                onClick={handleLogin}
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
            </div>
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
