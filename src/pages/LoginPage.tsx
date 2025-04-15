
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { Mountain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // useEffect(() => {
  //   // Create an inner async function that only runs on initial mount
  //   const handleInitialSignOut = async () => {
  //     if (!hasLoggedOut) {
  //       try {
  //         await supabase.auth.signOut();
  //         console.log("User signed out successfully");
  //         setHasLoggedOut(true);
  //       } catch (error) {
  //         console.error("Error signing out:", error);
  //       }
  //     }
  //   };
  
  //   // Call the async function only on initial mount
  //   handleInitialSignOut();
  // }, [hasLoggedOut]);
  
  // // Redirect if already authenticated
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     console.log("User is authenticated, redirecting to dashboard");
  //     if (user.accountType === "CONSOLE") {
  //       navigate("/admin/dashboard");
  //     } else {
  //       navigate("/user/dashboard");
  //     }
  //   }
  // }, [isAuthenticated, user, navigate]);

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
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Login to Your Account</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
