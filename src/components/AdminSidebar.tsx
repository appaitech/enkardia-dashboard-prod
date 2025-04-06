
import React, { useState, useEffect } from "react";
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
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
          "w-full justify-start font-normal my-1", 
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Handle resize events to adjust sidebar state
  useEffect(() => {
    setIsOpen(!isMobile);
    setIsCollapsed(false);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
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
      </div>
      
      <div className="p-4 border-t mt-auto">
        {user && (
          <div className="mb-4 px-2">
            <div className="font-medium text-sm">{user.name}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
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
  );

  // Mobile version uses Sheet component for better mobile UX
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-40 bg-white/80 backdrop-blur-sm rounded-full shadow-md"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-[270px] max-w-[80vw]">
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop version
  return (
    <div 
      className={cn(
        "h-screen bg-white flex flex-col z-30 transition-all duration-300 ease-in-out border-r",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      {isCollapsed ? (
        <div className="p-4 flex justify-center border-b">
          <Badge className="bg-blue-100 text-blue-700 uppercase">
            CP
          </Badge>
        </div>
      ) : (
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl text-blue-700">Console Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Admin Dashboard</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCollapsed}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft size={20} />
          </Button>
        </div>
      )}
      
      {isCollapsed ? (
        <div className="flex-1 p-2 space-y-4 overflow-y-auto">
          <Link to="/admin/dashboard" onClick={closeSidebarOnMobile}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-full h-10",
                activePath === "/admin/dashboard" 
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <LayoutDashboard size={20} />
            </Button>
          </Link>
          
          <Link to="/admin/users" onClick={closeSidebarOnMobile}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-full h-10",
                activePath === "/admin/users" 
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Users size={20} />
            </Button>
          </Link>
          
          <Link to="/admin/clients" onClick={closeSidebarOnMobile}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-full h-10",
                activePath === "/admin/clients" 
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Building size={20} />
            </Button>
          </Link>
          
          {user?.role === "ADMIN" && (
            <Link to="/admin/settings" onClick={closeSidebarOnMobile}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-10",
                  activePath === "/admin/settings" 
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Settings size={20} />
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="w-full h-10 mt-auto absolute bottom-4 left-0 right-0 mx-auto text-slate-600 hover:bg-slate-100"
            onClick={toggleCollapsed}
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      ) : (
        renderSidebarContent()
      )}
    </div>
  );
};

export default AdminSidebar;
