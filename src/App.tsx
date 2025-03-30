import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import ClientsList from "./pages/admin/ClientsList";
import ClientDetail from "./pages/admin/ClientDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import { useState } from "react";

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
              
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedAccountTypes={["CONSOLE"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/clients" 
                element={
                  <ProtectedRoute allowedAccountTypes={["CONSOLE"]}>
                    <ClientsList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/clients/:clientId" 
                element={
                  <ProtectedRoute allowedAccountTypes={["CONSOLE"]}>
                    <ClientDetail />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/user/dashboard" 
                element={
                  <ProtectedRoute allowedAccountTypes={["CLIENT"]}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
