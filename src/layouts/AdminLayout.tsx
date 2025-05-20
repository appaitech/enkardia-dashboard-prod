
import React from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePath={location.pathname} />
      <main className="flex-1 p-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
