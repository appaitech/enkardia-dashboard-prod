
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  Shield, 
  Bell,
  BarChart 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  badge?: string;
  adminOnly?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  href, 
  isActive,
  badge,
  adminOnly = false 
}) => {
  const { user } = useAuth();
  
  // Hide admin-only items from standard users
  if (adminOnly && user?.role !== "ADMIN") {
    return null;
  }
  
  return (
    <Link to={href}>
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
  
  return (
    <div className="h-screen w-64 border-r bg-white flex flex-col">
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
      
      <div className="flex-1 p-4 space-y-1">
        <SidebarItem 
          icon={<LayoutDashboard size={18} />} 
          label="Dashboard" 
          href="/user/dashboard"
          isActive={activePath === "/user/dashboard"}
        />
        
        {/* Financial Section */}
        <div className="pt-4">
          <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">FINANCIAL</h3>
          <SidebarItem 
            icon={<BarChart size={18} />} 
            label="Profit & Loss" 
            href="/user/financial/profit-loss"
            isActive={activePath === "/user/financial/profit-loss"}
          />
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          onClick={logout}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserSidebar;
