
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, User, Building, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AccountType, UserRole } from "@/contexts/AuthContext";

const LoginPage = () => {
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupAccountType, setSignupAccountType] = useState<AccountType>("CLIENT");
  const [signupRole, setSignupRole] = useState<UserRole>("STANDARD");
  const [signupError, setSignupError] = useState("");
  
  // Local loading states to manage button states independently from the global isLoading
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  
  const { login, signup } = useAuth();
  
  // Reset loading states when component mounts
  useEffect(() => {
    setIsLoginLoading(false);
    setIsSignupLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);
    
    if (!loginEmail || !loginPassword) {
      setLoginError("Email and password are required");
      setIsLoginLoading(false);
      return;
    }
    
    try {
      await login(loginEmail, loginPassword);
      // If login succeeds, don't reset loading state as page will redirect
    } catch (error: any) {
      setLoginError(error.message || "Login failed");
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setIsSignupLoading(true);
    
    if (!signupEmail || !signupPassword || !signupName) {
      setSignupError("All fields are required");
      setIsSignupLoading(false);
      return;
    }
    
    try {
      await signup(signupEmail, signupPassword, signupName, signupAccountType, signupRole);
      // If signup succeeds, the page may not redirect immediately
    } catch (error: any) {
      setSignupError(error.message || "Signup failed");
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Secure Portal</h1>
          <p className="text-slate-500 mt-2">Access your customized dashboard</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input 
                        id="password"
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoginLoading}
                    >
                      {isLoginLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
              
              <CardFooter className="flex flex-col space-y-4 border-t pt-4">
                <div className="text-sm text-center text-slate-500">
                  <p>Demo accounts will be created when you sign up</p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Create Account</CardTitle>
                <CardDescription>
                  Set up your new account with role and access type
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  {signupError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{signupError}</AlertDescription>
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
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
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
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
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
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-account-type">Account Type</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Select
                        value={signupAccountType}
                        onValueChange={(value) => setSignupAccountType(value as AccountType)}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select Account Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONSOLE">Console</SelectItem>
                          <SelectItem value="CLIENT">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-slate-500">
                      Console users access the admin dashboard, Client users access the user dashboard
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">User Role</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Select
                        value={signupRole}
                        onValueChange={(value) => setSignupRole(value as UserRole)}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-slate-500">
                      Admin roles have full access, Standard roles have limited access
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSignupLoading}
                    >
                      {isSignupLoading ? (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
