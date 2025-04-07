import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { Mountain } from "lucide-react";

const LoginPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User is authenticated, redirecting to dashboard");
      if (user.accountType === "CONSOLE") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-600 px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm shadow-xl">
              <Mountain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Enkardia</h1>
          <p className="text-lg text-blue-100/80">Elevate Your Business</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1.5 rounded-lg">
              <TabsTrigger 
                value="login" 
                className="rounded-md px-6 py-2.5 data-[state=active]:bg-navy-600 data-[state=active]:text-white text-gray-600 transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-md px-6 py-2.5 data-[state=active]:bg-navy-600 data-[state=active]:text-white text-gray-600 transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-2">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-2">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
