import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

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
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
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
      
      <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 pt-6 mt-6">
        <div className="text-sm text-center text-gray-500">
          <p>Need an account? Switch to Sign Up</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
