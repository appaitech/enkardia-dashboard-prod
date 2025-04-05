import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientsList from './pages/admin/ClientsList';
import ClientDetail from './pages/admin/ClientDetail';
import UserDashboard from './pages/user/UserDashboard';
import TasksPage from './pages/user/TasksPage';
import ProfitAndLossPage from './pages/user/ProfitAndLossPage';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
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
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
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
            
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedAccountTypes={["CLIENT"]}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/financial/profit-loss" 
              element={
                <ProtectedRoute allowedAccountTypes={["CLIENT"]}>
                  <ProfitAndLossPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/tasks" 
              element={
                <ProtectedRoute allowedAccountTypes={["CLIENT"]}>
                  <TasksPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
