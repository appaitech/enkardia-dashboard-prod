
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect based on role
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <ShieldCheck className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-slate-800">Secure Portal</h1>
          </div>
          <Button 
            onClick={() => navigate("/login")}
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Sign In
          </Button>
        </header>

        <main className="max-w-4xl mx-auto text-center mt-20">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Secure Access Portal for <span className="text-blue-600">Teams</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            A secure dashboard for your organization with role-based access. Separate interfaces for administrators and standard users.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={handleGetStarted} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-6 h-auto"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Access</h3>
              <p className="text-slate-600">Role-based authentication ensures users only see what they're permitted to access.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  <path d="M19 3v4"></path>
                  <path d="M23 7h-4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">User Dashboard</h3>
              <p className="text-slate-600">Personalized user interface with relevant tools and information for standard users.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Admin Control</h3>
              <p className="text-slate-600">Comprehensive admin panel with analytics, user management, and system settings.</p>
            </div>
          </div>
        </main>
        
        <footer className="mt-24 text-center text-slate-500 text-sm">
          <p>© 2023 Secure Portal. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
