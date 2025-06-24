
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  UserRound
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
          "w-full justify-start font-medium my-0.5 transition-all duration-200 rounded-lg", 
          isActive 
            ? "bg-navy-100/80 text-navy-700 hover:bg-navy-200/60" 
            : "text-navy-600/80 hover:bg-navy-50 hover:text-navy-700"
        )}
      >
        {icon}
        <span className="ml-3">{label}</span>
        {badge && (
          <span className="ml-auto bg-navy-100 text-navy-700 text-xs font-semibold rounded-full px-2.5 py-1">
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
      <div className="p-6 border-b border-navy-100">
        <h2 className="font-bold text-2xl text-navy-700 tracking-tight">Console Portal</h2>
        <p className="text-sm text-navy-500/80 mt-1 font-medium">Admin Dashboard</p>
      </div>
      
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            href="/admin/dashboard" 
            onClick={closeSidebarOnMobile}
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Users" 
            href="/admin/users" 
            onClick={closeSidebarOnMobile}
          />
          <SidebarItem 
            icon={<Building size={20} />} 
            label="Clients" 
            href="/admin/clients" 
            onClick={closeSidebarOnMobile}
          />
          <SidebarItem 
            icon={<UserRound size={20} />} 
            label="Directors" 
            href="/admin/directors" 
            onClick={closeSidebarOnMobile}
          />
          <SidebarItem 
            icon={<LinkIcon size={20} />} 
            label="Xero Connections" 
            href="/admin/xero-connections" 
            onClick={closeSidebarOnMobile}
          />
          {/* <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            href="/admin/settings" 
            adminOnly={true}
            onClick={closeSidebarOnMobile}
          /> */}
        </div>
      </div>
      
      <div className="p-4 border-t border-navy-100 bg-gradient-to-b from-navy-50/50 to-navy-50/10">
        {user && (
          <div className="mb-4 px-2">
            <div className="font-semibold text-sm text-navy-700">{user.name}</div>
            <div className="text-xs text-navy-500/80 truncate mt-0.5">{user.email}</div>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-navy-600 hover:bg-navy-100 hover:text-navy-800 transition-all duration-200 font-medium"
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
          className="fixed top-4 left-4 z-40 bg-white shadow-lg rounded-full hover:bg-navy-50 transition-all duration-200"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={20} className="text-navy-600" /> : <Menu size={20} className="text-navy-600" />}
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-[270px] max-w-[80vw]">
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop version - updated to not overlap content
  return (
    <>
      <div 
        className={cn(
          "h-screen bg-white fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out border-r border-navy-100 flex flex-col",
          isCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        {isCollapsed ? (
          <div className="p-4 flex justify-center border-b border-navy-100">
            <Badge className="bg-navy-100 text-navy-700 uppercase font-semibold">
              CP
            </Badge>
          </div>
        ) : (
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="font-bold text-xl text-navy-700">Console Portal</h2>
              <p className="text-xs text-navy-500 mt-1">Admin Dashboard</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapsed}
              className="ml-auto text-navy-400 hover:text-navy-600"
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
                    ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                    : "text-navy-600 hover:bg-navy-50"
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
                    ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                    : "text-navy-600 hover:bg-navy-50"
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
                    ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                    : "text-navy-600 hover:bg-navy-50"
                )}
              >
                <Building size={20} />
              </Button>
            </Link>
            
            <Link to="/admin/directors" onClick={closeSidebarOnMobile}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-10",
                  activePath === "/admin/directors" 
                    ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                    : "text-navy-600 hover:bg-navy-50"
                )}
              >
                <UserRound size={20} />
              </Button>
            </Link>
            
            <Link to="/admin/xero-connections" onClick={closeSidebarOnMobile}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-10",
                  activePath === "/admin/xero-connections" 
                    ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                    : "text-navy-600 hover:bg-navy-50"
                )}
              >
                <LinkIcon size={20} />
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
                      ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                      : "text-navy-600 hover:bg-navy-50"
                  )}
                >
                  <Settings size={20} />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          renderSidebarContent()
        )}
        
        {isCollapsed && (
          <div className="p-2 mt-auto border-t border-navy-100">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-full text-navy-600 hover:bg-navy-50"
              onClick={toggleCollapsed}
            >
              <ChevronRight size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-full mt-2 text-navy-600 hover:bg-navy-50"
              onClick={() => logout()}
            >
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* Add a spacer div to prevent content from being hidden behind the sidebar */}
      <div className={isCollapsed ? "w-[70px]" : "w-64"} />
    </>
  );
};

export default AdminSidebar;
