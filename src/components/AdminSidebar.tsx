
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, FileText, BarChart3, LogOut } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, isActive }) => (
  <Link to={href}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 font-normal",
        isActive 
          ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </Button>
  </Link>
);

interface AdminSidebarProps {
  activePath: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePath }) => {
  const { logout } = useAuth();

  return (
    <div className="h-screen w-64 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-xl text-blue-700">Admin Portal</h2>
      </div>
      
      <div className="flex-1 p-4 space-y-1">
        <SidebarItem 
          icon={<LayoutDashboard size={18} />} 
          label="Dashboard" 
          href="/admin/dashboard"
          isActive={activePath === "/admin/dashboard"}
        />
        <SidebarItem 
          icon={<Users size={18} />} 
          label="Users" 
          href="/admin/users"
          isActive={activePath === "/admin/users"}
        />
        <SidebarItem 
          icon={<FileText size={18} />} 
          label="Reports" 
          href="/admin/reports"
          isActive={activePath === "/admin/reports"}
        />
        <SidebarItem 
          icon={<BarChart3 size={18} />} 
          label="Analytics" 
          href="/admin/analytics"
          isActive={activePath === "/admin/analytics"}
        />
        <SidebarItem 
          icon={<Settings size={18} />} 
          label="Settings" 
          href="/admin/settings"
          isActive={activePath === "/admin/settings"}
        />
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

export default AdminSidebar;
