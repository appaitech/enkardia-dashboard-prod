
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
        
        <CardFooter className="flex justify-center border-t pt-4">
          <Button onClick={() => navigate("/login")} className="w-full">
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;
