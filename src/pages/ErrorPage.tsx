
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, title } = location.state || {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again or contact support."
  };

  // Determine where to redirect based on whether there's a logged-in user
  const handleGoBack = () => {
    // This will try to go back in history, or if not possible, go to login
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            {title}
          </CardTitle>
          <CardDescription>
            We encountered an issue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center">
            <p className="mb-6 text-slate-700">{message}</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="w-1/2 mr-2"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/login")} 
            className="w-1/2 ml-2"
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;
