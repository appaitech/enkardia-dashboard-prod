
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Console (Admin) Routes */}
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
            
            {/* Client (User) Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedAccountTypes={["CLIENT"]}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
