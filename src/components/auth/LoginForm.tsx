
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }
    
    try {
      await login(email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed");
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }
    
    try {
      // Use the full URL including the https:// protocol to ensure proper redirection
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

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

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
          <form onSubmit={handleResetPassword}>
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
                  type="submit" 
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white py-6 rounded-lg text-base font-medium transition-colors duration-200"
                  disabled={isLoading}
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
          </form>
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
      
      <form onSubmit={handleLogin}>
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
              <Button 
                type="button" 
                variant="link" 
                className="text-sm text-navy-600 p-0 h-auto"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot password?
              </Button>
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
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-navy-600 hover:bg-navy-700 text-white py-6 rounded-lg text-base font-medium transition-colors duration-200"
              disabled={isLoading}
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
      </form>
    </Card>
  );
};

export default LoginForm;
