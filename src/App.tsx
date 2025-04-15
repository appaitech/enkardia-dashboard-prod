import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import ErrorPage from './pages/ErrorPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientsList from './pages/admin/ClientsList';
import ClientDetail from './pages/admin/ClientDetail';
import UserDashboard from './pages/user/UserDashboard';
import TasksPage from './pages/user/TasksPage';
import CallToActionsPage from './pages/user/CallToActionsPage';
import ProfitAndLossPage from './pages/user/ProfitAndLossPage';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from './components/ProtectedRoute';
import UsersManagement from "./pages/admin/UsersManagement";
import XeroConnectionsPage from './pages/admin/XeroConnectionsPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Index from "./pages/Index";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AccountLinkingPage from "./pages/user/AccountLinkingPage";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route 
                path="/user/account/linking" 
                element={<ProtectedRoute><AccountLinkingPage /></ProtectedRoute>} 
              />
              
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
                path="/admin/xero-connections" 
                element={
                  <ProtectedRoute allowedAccountTypes={["CONSOLE"]}>
                    <XeroConnectionsPage />
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
              
              <Route 
                path="/user/call-to-actions" 
                element={
                  <ProtectedRoute allowedAccountTypes={["CLIENT"]}>
                    <CallToActionsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
