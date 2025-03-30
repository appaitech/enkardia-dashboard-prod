import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientsList from './pages/admin/ClientsList';
import ClientDetail from './pages/admin/ClientDetail';
import UserDashboard from './pages/user/UserDashboard';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from './components/ProtectedRoute';
import UsersManagement from "./pages/admin/UsersManagement";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
            
            {/* Admin routes */}
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
              path="/admin/clients/:id" 
              element={
                <ProtectedRoute allowedAccountTypes={["CONSOLE"]}>
                  <ClientDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedAccountTypes={["CONSOLE"]}>
                  <UsersManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* User routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedAccountTypes={["CLIENT"]}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
