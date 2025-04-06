
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Settings, 
  LogOut, 
  Bell, 
  Menu,
  X
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  adminOnly?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon,
  label,
  href,
  badge,
  adminOnly = false,
  onClick
}: SidebarItemProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
  
  if (adminOnly && user?.role !== "ADMIN") {
    return null;
  }
  
  return (
    <Link to={href} onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start font-normal mb-1", 
          isActive 
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        {icon}
        <span className="ml-3">{label}</span>
        {badge && (
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium rounded px-1.5 py-0.5">
            {badge}
          </span>
        )}
      </Button>
    </Link>
  );
};

interface AdminSidebarProps {
  activePath: string;
}

const AdminSidebar = ({ activePath }: AdminSidebarProps) => {
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      )}
      
      {/* Overlay when sidebar is open on mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div 
        className={cn(
          "h-screen border-r bg-white flex flex-col z-50",
          isMobile 
            ? isOpen 
              ? "fixed left-0 top-0 w-64 shadow-lg transition-transform duration-300 ease-in-out" 
              : "fixed left-0 top-0 w-64 -translate-x-full transition-transform duration-300 ease-in-out"
            : "w-64"
        )}
      >
        <div className="p-4 border-b">
          <h2 className="font-bold text-xl text-blue-700">Console Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Admin Dashboard</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            href="/admin/dashboard" 
            onClick={closeSidebarOnMobile}
          />
          <SidebarItem 
            icon={<Users size={18} />} 
            label="Users" 
            href="/admin/users" 
            onClick={closeSidebarOnMobile}
          />
          <SidebarItem 
            icon={<Building size={18} />} 
            label="Clients" 
            href="/admin/clients" 
            onClick={closeSidebarOnMobile}
          />
          <SidebarItem 
            icon={<Settings size={18} />} 
            label="Settings" 
            href="/admin/settings" 
            adminOnly={true} 
            onClick={closeSidebarOnMobile}
          />
        </div>
        
        <div className="p-4 border-t mt-auto">
          {user && (
            <div className="mb-4 px-2">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              closeSidebarOnMobile();
              logout();
            }}
          >
            <LogOut size={18} />
            <span className="ml-3">Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
