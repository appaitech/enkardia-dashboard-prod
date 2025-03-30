
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect based on account type
      if (user?.accountType === "CONSOLE") {
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
          {isAuthenticated ? (
            <div className="flex gap-4 items-center">
              <div className="text-right hidden sm:block">
                <p className="font-medium">{user?.name}</p>
                <div className="flex gap-2 justify-end mt-1">
                  <Badge variant="outline" className="text-xs">
                    {user?.accountType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => user?.accountType === "CONSOLE" ? navigate("/admin/dashboard") : navigate("/user/dashboard")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Dashboard <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => navigate("/login")}
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Sign In
            </Button>
          )}
        </header>

        <main className="max-w-4xl mx-auto text-center mt-20">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Secure Access Portal for <span className="text-blue-600">Teams</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            A secure dashboard with role-based access. Separate interfaces for console and client users with different admin privileges.
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
          
          <div className="mt-20 grid md:grid-cols-2 gap-8">
            <Card className="text-left p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 9h6v6H9z" />
                    <path d="M14 14h1v4h-6v-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Console Portal</h3>
                  <Badge className="bg-blue-500">CONSOLE</Badge>
                </div>
              </div>
              <p className="text-slate-600 mb-4">
                Comprehensive admin control panel with advanced system management, user controls, and detailed analytics.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50">ADMIN Role</Badge>
                <Badge variant="outline" className="bg-slate-50">STANDARD Role</Badge>
              </div>
            </Card>
            
            <Card className="text-left p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Client Portal</h3>
                  <Badge className="bg-green-500">CLIENT</Badge>
                </div>
              </div>
              <p className="text-slate-600 mb-4">
                Focused user interface with personalized dashboard, document management, and collaboration tools.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-purple-50">ADMIN Role</Badge>
                <Badge variant="outline" className="bg-slate-50">STANDARD Role</Badge>
              </div>
            </Card>
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
