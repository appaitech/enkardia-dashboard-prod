
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, User, Building, ShieldCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AccountType, UserRole } from "@/contexts/AuthContext";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("CLIENT");
  const [role, setRole] = useState<UserRole>("STANDARD");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();

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
      await signup(email, password, name, accountType, role);
      // If signup succeeds, reset the loading state
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
          Set up your new account with role and access type
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
          
          <div className="space-y-2">
            <Label htmlFor="signup-account-type">Account Type</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Select
                value={accountType}
                onValueChange={(value) => setAccountType(value as AccountType)}
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
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
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
