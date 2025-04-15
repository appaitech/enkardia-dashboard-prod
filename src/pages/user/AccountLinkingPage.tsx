
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AccountLinkingPage = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProviders = async () => {
      try {
        // Get identities from user
        const identities = user.identities || [];
        const providerList = identities.map(identity => identity.provider);
        setProviders(providerList);
        
        // Set email from user
        setEmail(user.email || "");
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };

    fetchProviders();
  }, [user, navigate]);

  const handleLinkPassword = async () => {
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Update user with password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success("Password successfully set");
      await refreshUserData();
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error setting password:", error);
      setError(error.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    // Check if user has password set first
    const hasPasswordProvider = providers.includes("email");
    
    if (!hasPasswordProvider) {
      toast.error("You must set a password before unlinking Google");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.unlinkIdentity({
        provider: "google"
      });
      
      if (error) throw error;
      
      toast.success("Google account unlinked successfully");
      await refreshUserData();
      
      // Refresh providers list
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        const identities = updatedUser.identities || [];
        const providerList = identities.map(identity => identity.provider);
        setProviders(providerList);
      }
      
    } catch (error: any) {
      console.error("Error unlinking Google:", error);
      toast.error(error.message || "Failed to unlink Google account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?linking=true`,
        },
      });
      
      if (error) throw error;
      
      // User will be redirected to Google
    } catch (error: any) {
      console.error("Error linking Google:", error);
      toast.error(error.message || "Failed to link Google account");
      setIsLoading(false);
    }
  };

  const hasGoogleProvider = providers.includes("google");
  const hasPasswordProvider = providers.includes("email");

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email & Password</CardTitle>
            <CardDescription>
              {hasPasswordProvider 
                ? "Update your account password" 
                : "Set a password to login with email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="confirm-password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleLinkPassword();
                      }
                    }}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleLinkPassword}
                disabled={isLoading || !password || !confirmPassword}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Saving...
                  </>
                ) : (
                  hasPasswordProvider ? "Update Password" : "Set Password"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Manage your connected authentication providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-8 w-8">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Google</h3>
                    <p className="text-sm text-gray-500">
                      {hasGoogleProvider ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                
                {hasGoogleProvider ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleUnlinkGoogle}
                    disabled={isLoading || !hasPasswordProvider}
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disconnect"}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLinkGoogle}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                  </Button>
                )}
              </div>
              
              {hasGoogleProvider && !hasPasswordProvider && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    You must set a password before disconnecting your Google account
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountLinkingPage;
