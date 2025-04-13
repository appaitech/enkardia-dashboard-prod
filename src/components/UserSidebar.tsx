
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ClientBusinessSelector } from "./ClientBusinessSelector";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart4,
  LogOut,
  Menu,
  ChevronDown,
  Bell
} from "lucide-react";

interface UserSidebarProps {
  activePath: string;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ activePath }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFinancialSubmenuOpen, setIsFinancialSubmenuOpen] = useState(
    activePath.includes("/user/financial")
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/user/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Tasks",
      path: "/user/tasks",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: "Call To Actions",
      path: "/user/call-to-actions",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      name: "Financial",
      submenu: [
        {
          name: "Profit & Loss",
          path: "/user/financial/profit-loss",
        },
      ],
      icon: <BarChart4 className="w-5 h-5" />,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/user/dashboard") {
      return activePath === path;
    }
    return activePath.startsWith(path);
  };

  const NavContent = () => (
    <>
      <div className="px-2 py-4">
        <ClientBusinessSelector />
      </div>

      <div className="space-y-1 px-2">
        {navItems.map((item) =>
          !item.submenu ? (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                className="w-full justify-start"
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Button>
            </Link>
          ) : (
            <div key={item.name} className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isFinancialSubmenuOpen ? "bg-slate-100" : ""
                }`}
                onClick={() => setIsFinancialSubmenuOpen(!isFinancialSubmenuOpen)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
                <ChevronDown
                  className={`ml-auto h-5 w-5 transform transition-transform ${
                    isFinancialSubmenuOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {isFinancialSubmenuOpen && (
                <div className="pl-9 space-y-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.name}
                      to={subitem.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(subitem.path) ? "default" : "ghost"}
                        className="w-full justify-start text-sm"
                      >
                        {subitem.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

      <div className="px-2 mt-auto pb-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </Button>
      </div>
    </>
  );

  // Mobile sidebar using Sheet component
  const MobileSidebar = () => (
    <div className="lg:hidden flex items-center px-4 py-2 border-b">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 flex flex-col">
          <NavContent />
        </SheetContent>
      </Sheet>
      <div className="ml-4 flex-1">
        <h2 className="text-lg font-semibold">Client Portal</h2>
      </div>
    </div>
  );

  return (
    <>
      <MobileSidebar />

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold">Client Portal</h1>
          </div>
          <div className="flex-1 flex flex-col justify-between mt-5">
            <NavContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
