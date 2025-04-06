import React, { useState, useEffect } from "react";
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
  X,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
          "w-full justify-start gap-3 font-normal my-1 transition-all duration-200",
          isActive 
            ? "bg-navy-50 text-navy-700 hover:bg-navy-100 hover:text-navy-800" 
            : "text-navy-600/80 hover:bg-navy-50/50 hover:text-navy-700"
        )}
      >
        {icon}
        <span className="flex-1 text-left font-medium">{label}</span>
        {badge && (
          <Badge variant="secondary" className="ml-auto bg-navy-100 text-navy-700">
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
        <h2 className="font-bold text-2xl text-navy-700 tracking-tight">Client Portal</h2>
        <div className="flex items-center mt-3 space-x-2">
          <Badge 
            variant={user?.role === "ADMIN" ? "default" : "outline"}
            className={cn(
              "px-2.5 py-1 font-medium",
              user?.role === "ADMIN" 
                ? "bg-navy-100/80 text-navy-700 border-navy-200" 
                : "text-navy-600 border-navy-200"
            )}
          >
            {user?.role}
          </Badge>
          <Badge 
            variant="outline" 
            className="bg-navy-50/30 text-navy-600 border-navy-200 px-2.5 py-1 font-medium"
          >
            {user?.accountType}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />}
            label="Dashboard" 
            href="/user/dashboard"
            isActive={activePath === "/user/dashboard"}
            onClick={closeSidebarOnMobile}
          />
        </div>
        
        <div className="pt-6">
          <h3 className="mb-3 px-4 text-xs font-bold text-navy-500 uppercase tracking-wider">
            Financial
          </h3>
          <SidebarItem 
            icon={<BarChart size={18} />} 
            label="Profit & Loss" 
            href="/user/financial/profit-loss"
            isActive={activePath === "/user/financial/profit-loss"}
            onClick={closeSidebarOnMobile}
          />
        </div>
        
        <div className="pt-4">
          <h3 className="mb-2 px-2 text-xs font-semibold text-navy-500 uppercase tracking-wider">
            TASKS
          </h3>
          <SidebarItem 
            icon={<ListChecks size={18} />} 
            label="Task Statuses" 
            href="/user/tasks"
            isActive={activePath === "/user/tasks"}
            onClick={closeSidebarOnMobile}
          />
        </div>
      </div>
      
      <div className="p-4 border-t border-navy-100 mt-auto bg-navy-50/30">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-navy-600 hover:bg-navy-100 hover:text-navy-800 transition-all duration-200"
          onClick={() => {
            closeSidebarOnMobile();
            logout();
          }}
        >
          <LogOut size={18} />
          <span className="ml-2 font-medium">Sign Out</span>
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
          className="fixed top-4 left-4 z-40 bg-white/90 shadow-lg rounded-full hover:bg-navy-50 transition-all duration-200 backdrop-blur-sm"
          onClick={toggleSidebar}
        >
          {isOpen ? (
            <X size={20} className="text-navy-600" />
          ) : (
            <Menu size={20} className="text-navy-600" />
          )}
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
        "h-screen bg-white flex flex-col z-30 transition-all duration-300 ease-in-out border-r border-navy-100",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      {isCollapsed ? (
        <div className="p-4 flex justify-center border-b border-navy-100">
          <Badge 
            variant="outline" 
            className="bg-navy-50/50 text-navy-700 uppercase font-semibold px-2.5 py-1.5"
          >
            CP
          </Badge>
        </div>
      ) : (
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl text-navy-700">Client Portal</h2>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant={user?.role === "ADMIN" ? "default" : "outline"}
                className={cn(
                  user?.role === "ADMIN" 
                    ? "bg-navy-100 text-navy-700 border-navy-200" 
                    : "text-navy-600 border-navy-200"
                )}
              >
                {user?.role}
              </Badge>
            </div>
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
          <Link to="/user/dashboard" onClick={closeSidebarOnMobile}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-full h-10",
                activePath === "/user/dashboard" 
                  ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                  : "text-navy-600 hover:bg-navy-50"
              )}
            >
              <LayoutDashboard size={20} />
            </Button>
          </Link>
          
          <div className="pt-2">
            <Link to="/user/financial/profit-loss" onClick={closeSidebarOnMobile}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-10",
                  activePath === "/user/financial/profit-loss" 
                    ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                    : "text-navy-600 hover:bg-navy-50"
                )}
              >
                <BarChart size={20} />
              </Button>
            </Link>
          </div>
          
          <div className="pt-2">
            <Link to="/user/tasks" onClick={closeSidebarOnMobile}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-10",
                  activePath === "/user/tasks" 
                    ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                    : "text-navy-600 hover:bg-navy-50"
                )}
              >
                <ListChecks size={20} />
              </Button>
            </Link>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="w-full h-10 mt-auto absolute bottom-4 left-0 right-0 mx-auto text-navy-600 hover:bg-navy-100"
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

export default UserSidebar;
