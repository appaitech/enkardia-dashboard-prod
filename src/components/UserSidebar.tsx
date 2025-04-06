
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  Shield, 
  Bell,
  BarChart,
  ListChecks,
  Menu,
  X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  badge?: string;
  adminOnly?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  href, 
  isActive,
  badge,
  adminOnly = false,
  onClick 
}) => {
  const { user } = useAuth();
  
  if (adminOnly && user?.role !== "ADMIN") {
    return null;
  }
  
  return (
    <Link to={href} onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal",
          isActive 
            ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <Badge variant="secondary" className="ml-auto">
            {badge}
          </Badge>
        )}
      </Button>
    </Link>
  );
};

interface UserSidebarProps {
  activePath: string;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ activePath }) => {
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
          <h2 className="font-bold text-xl text-green-700">Client Portal</h2>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant={user?.role === "ADMIN" ? "default" : "outline"}>
              {user?.role}
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              {user?.accountType}
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            href="/user/dashboard"
            isActive={activePath === "/user/dashboard"}
            onClick={closeSidebarOnMobile}
          />
          
          <div className="pt-4">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">FINANCIAL</h3>
            <SidebarItem 
              icon={<BarChart size={18} />} 
              label="Profit & Loss" 
              href="/user/financial/profit-loss"
              isActive={activePath === "/user/financial/profit-loss"}
              onClick={closeSidebarOnMobile}
            />
          </div>
          
          <div className="pt-4">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">TASKS</h3>
            <SidebarItem 
              icon={<ListChecks size={18} />} 
              label="Task Statuses" 
              href="/user/tasks"
              isActive={activePath === "/user/tasks"}
              onClick={closeSidebarOnMobile}
            />
          </div>
        </div>
        
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              closeSidebarOnMobile();
              logout();
            }}
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
