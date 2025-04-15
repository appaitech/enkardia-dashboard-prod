
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  useEffect(() => {
    const checkForErrors = () => {
      setIsProcessing(true);
      
      try {
        console.log("Current URL:", window.location.href);
        console.log("URL hash:", window.location.hash);
        
        // Check for error in the URL hash
        const hashPart = window.location.hash.substring(1);
        
        if (hashPart && hashPart.includes("error=")) {
          // Parse the hash to extract error details
          const hashParams = new URLSearchParams(hashPart);
          const errorType = hashParams.get("error");
          const errorCode = hashParams.get("error_code");
          const errorDescription = hashParams.get("error_description")?.replace(/\+/g, " ");
          
          console.log("Error details:", { errorType, errorCode, errorDescription });
          
          if (errorDescription) {
            setError(errorDescription);
          } else if (errorCode === "otp_expired") {
            setError("The password reset link has expired. Please request a new one.");
          } else {
            setError("Invalid or expired password reset link. Please request a new one.");
          }
        } else {
          // No error in URL, we can proceed with password reset
          setError(null);
        }
      } catch (err: any) {
        console.error("Error checking URL for errors:", err);
        setError("Something went wrong. Please try again or request a new password reset link.");
      } finally {
        setIsProcessing(false);
      }
    };
    
    checkForErrors();
  }, [location]);
  
  const handlePasswordReset = async () => {
    // Validate form data
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    
    const data = form.getValues();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to update password");
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (updateError) {
        console.error("Password update error:", updateError);
        throw updateError;
      }
      
      console.log("Password updated successfully");
      setIsSuccess(true);
      toast.success("Your password has been successfully reset");
      
      // Log the user out after successful password reset
      await supabase.auth.signOut();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state while checking URL
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-600 px-6 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Verifying Reset Link</CardTitle>
              <CardDescription>
                Please wait while we verify your password reset link...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <Loader2 className="h-12 w-12 text-navy-600 animate-spin mb-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-600 px-6 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-red-600">Invalid Reset Link</CardTitle>
              <CardDescription>
                We couldn't process your password reset request.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <p className="text-gray-600 mb-6 text-center">
                Please request a new password reset link from the login page.
              </p>
              <Button onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-600 px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              {isSuccess 
                ? "Your password has been successfully reset" 
                : "Create a new password for your account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-center text-gray-600">
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...form.register("password")}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...form.register("confirmPassword")}
                    />
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <Button
                  type="button"
                  className="w-full"
                  disabled={isLoading}
                  onClick={handlePasswordReset}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
