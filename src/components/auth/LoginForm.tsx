import React, { useState, useEffect, useLayoutEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  
  const { login } = useAuth();

  const firstRender = React.useRef(true);

  useLayoutEffect(() => {
    if (!firstRender.current) return;
    firstRender.current = false;
    
    const signOutOnMount = async () => {
      try {
        await supabase.auth.signOut();
        console.log("User signed out successfully");
      } catch (error) {
        console.error("Error signing out:", error);
      } finally {
        setIsLoading(false);
      }
    };

    signOutOnMount();
  }, []);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    
    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      console.log('data', data);
      console.log('error', error);

      if (error) {
        throw error;
      }

      if (data.user !== null && data.user.user_metadata) {
        const user_metadata = data.user.user_metadata;
        if (user_metadata.account_type === "CONSOLE") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      // The user will be redirected to Google for authentication
      // After successful authentication, they will be redirected back to your application
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || "Google login failed");
      setIsGoogleLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setIsLoading(true);
    
    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }
    
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log("Reset password redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        throw error;
      }
      
      setResetEmailSent(true);
      toast.success("Password reset email sent");
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(error.message || "Failed to send reset password email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError("");
  };

  if (isForgotPassword) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="space-y-2 pb-8">
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
          <CardDescription className="text-base text-gray-600">
            {resetEmailSent 
              ? "Check your email for a reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        
        {!resetEmailSent ? (
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border border-red-100 text-red-600 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  id="reset-email"
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-12 py-6 bg-gray-50 border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-navy-600 focus:ring-navy-600/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                type="button" 
                className="w-full bg-navy-600 hover:bg-navy-700 text-white py-6 rounded-lg text-base font-medium transition-colors duration-200"
                disabled={isLoading}
                onClick={handleResetPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm">A password reset link has been sent to your email address. Please check your inbox.</p>
              </div>
            </div>
          </CardContent>
        )}
        
        <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 pt-6 mt-6">
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:text-navy-600"
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="space-y-2 pb-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-base text-gray-600">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-50 border border-red-100 text-red-600 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              id="email"
              type="email" 
              placeholder="name@example.com" 
              className="pl-12 py-6 bg-gray-50 border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-navy-600 focus:ring-navy-600/20 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            {/* <Button 
              type="button" 
              variant="link" 
              className="text-sm text-navy-600 p-0 h-auto"
              onClick={() => setIsForgotPassword(true)}
            >
              Forgot password?
            </Button> */}
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              id="password"
              type="password" 
              placeholder="••••••••" 
              className="pl-12 py-6 bg-gray-50 border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-navy-600 focus:ring-navy-600/20 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            type="button" 
            className="w-full bg-navy-600 hover:bg-navy-700 text-white py-6 rounded-lg text-base font-medium transition-colors duration-200"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>

        
      </CardContent>
    </Card>
  );
};

export default LoginForm;

{/* <div className="relative flex items-center justify-center mt-4">
          <div className="border-t border-gray-200 flex-grow"></div>
          <div className="mx-4 text-gray-500 text-sm">or</div>
          <div className="border-t border-gray-200 flex-grow"></div>
        </div>

        <div>
          <Button 
            type="button" 
            variant="outline"
            className="w-full border-gray-300 py-6 rounded-lg text-base font-medium flex items-center justify-center space-x-2"
            disabled={isGoogleLoading}
            onClick={handleGoogleLogin}
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
                <span>Sign in with Google</span>
              </>
            )}
          </Button>
        </div> */}