import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ClientBusinessSelector from "./ClientBusinessSelector";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart4,
  LogOut,
  Menu,
  ChevronDown,
  Bell,
  X,
  ChevronRight,
  ChevronLeft,
  Settings
} from "lucide-react";
import { getUserClientBusinesses } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { useSelectedBusiness } from "@/hooks/useSelectedBusiness";
import { DataModel, useFinancialStore } from "@/store/financialStore";

interface UserSidebarProps {
  activePath: string;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ activePath }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFinancialSubmenuOpen, setIsFinancialSubmenuOpen] = useState(
    activePath.includes("/user/financial")
  );

  const { data: dataModel, setData } = useFinancialStore();

  const { selectedBusinessId, handleBusinessSelect } = useSelectedBusiness();

  const { 
      data: clientBusinesses,
      isLoading: isLoadingBusinesses,
      isError: isBusinessError,
      refetch: refetchBusinesses
    } = useQuery({
      queryKey: ["user-client-businesses", user?.id],
      queryFn: () => getUserClientBusinesses(user?.id || ""),
      enabled: !!user?.id,
    });

  React.useEffect(() => {
    setIsOpen(!isMobile);
    setIsCollapsed(false);
  }, [isMobile]);

  const validBusinesses = clientBusinesses?.filter(business => business !== null) || [];

  // let navItems = [];

  // if () {

  // }

  const navItemsDashBoardOnly = [
    {
      name: "Dashboard",
      path: "/user/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
  ];

  const navItemsDashBoardPlus = [
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

  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    if (clientBusinesses?.length > 0) {
      setNavItems(navItemsDashBoardPlus);
    }
    else {
      setNavItems(navItemsDashBoardOnly);
    }
  }, [clientBusinesses]);

  useEffect(() => {
    if (clientBusinesses?.length && !selectedBusinessId) {
      const validBusinesses = clientBusinesses.filter(business => business !== null);
      if (validBusinesses.length > 0) {
        const firstBusinessId = validBusinesses[0].id;
        handleBusinessSelect(firstBusinessId);
      }
    }
  }, [clientBusinesses, selectedBusinessId, handleBusinessSelect]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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



  

  const isActive = (path: string) => {
    if (path === "/user/dashboard") {
      return activePath === path;
    }
    return activePath.startsWith(path);
  };

  console.log("navItems", navItems);

  // functions
  const selectBusiness = (businessId: string) => {
    const dataModel: DataModel = {
      selectedClientId: businessId
    };
    setData(dataModel);
  }

  //Hooks
  // useEffect(() => {

  // }, []);
  useEffect(() => {
    console.log('dataModel.selectedClientId', dataModel?.selectedClientId);
  }, [dataModel?.selectedClientId]);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-navy-100">
        <div className={`flex`}>
          <div>
            <h2 className="font-bold text-2xl text-navy-700 tracking-tight">Client Portal</h2>
            <p className="text-sm text-navy-500/80 mt-1 font-medium">User Dashboard</p>
          </div>
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapsed}
              className="ml-auto text-navy-400 hover:text-navy-600"
            >
              <ChevronLeft size={20} />
            </Button>
          </div>
        </div>
        
        
      </div>
      
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        {/* {validBusinesses.length > 0 && (
          <div className="w-full md:w-auto">
            <ClientBusinessSelector 
              clientBusinesses={validBusinesses}
              selectedBusinessId={dataModel?.selectedClientId}
              onBusinessSelect={selectBusiness}
            />
          </div>
        )} */}

        <div className="space-y-1">
          {navItems.map((item) =>
            !item.submenu ? (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeSidebarOnMobile}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-medium my-0.5 transition-all duration-200 rounded-lg", 
                    isActive(item.path) 
                      ? "bg-navy-100/80 text-navy-700 hover:bg-navy-200/60" 
                      : "text-navy-600/80 hover:bg-navy-50 hover:text-navy-700"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              </Link>
            ) : (
              <div key={item.name} className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-medium my-0.5 transition-all duration-200 rounded-lg", 
                    isFinancialSubmenuOpen || activePath.includes(item.name.toLowerCase())
                      ? "bg-navy-100/80 text-navy-700" 
                      : "text-navy-600/80 hover:bg-navy-50 hover:text-navy-700"
                  )}
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
                  <div className="ml-6 pl-3 border-l border-navy-100 space-y-1">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.name}
                        to={subitem.path}
                        onClick={closeSidebarOnMobile}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm font-medium rounded-lg",
                            isActive(subitem.path)
                              ? "bg-navy-100/80 text-navy-700 hover:bg-navy-200/60"
                              : "text-navy-600/80 hover:bg-navy-50 hover:text-navy-700"
                          )}
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
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span className="ml-3">Sign Out</span>
        </Button>
      </div>
    </div>
  );

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

  return (
    <>
      <div 
        className={cn(
          "h-screen bg-white fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out border-r border-navy-100 flex flex-col",
          isCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        {/* {isCollapsed ? (
          <div className="p-4 flex justify-center border-b border-navy-100">
            <Badge className="bg-navy-100 text-navy-700 uppercase font-semibold">
              CP
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapsed}
              className="ml-auto text-navy-400 hover:text-navy-600"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        ) : (
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="font-bold text-xl text-navy-700">Client Portal</h2>
              <p className="text-xs text-navy-500 mt-1">User Dashboard</p>
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
        )} */}

        {isCollapsed && 
        <>
          <div className="p-4 flex justify-center border-b border-navy-100">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleCollapsed}
                className="ml-auto text-navy-400 hover:text-navy-600"
              >
                <ChevronRight size={20} />
              </Button>
          </div>
          
        </>}
        
        {isCollapsed ? (
          <div className="flex-1 p-2 space-y-4 overflow-y-auto">
            {navItems.map((item, index) => {

              if (item.submenu) {
                const firstsubmenuItem = item.submenu[0];
                return <>
                  <Link key={index} to={firstsubmenuItem.path} onClick={closeSidebarOnMobile}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "w-full h-10",
                        isActive(firstsubmenuItem.path) 
                          ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                          : "text-navy-600 hover:bg-navy-50"
                      )}
                    >
                      {item.icon}
                    </Button>
                  </Link>
                </>
              }

              return <>
                <Link key={index} to={item.path} onClick={closeSidebarOnMobile}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-full h-10",
                      isActive(item.path) 
                        ? "bg-navy-50 text-navy-700 hover:bg-navy-100" 
                        : "text-navy-600 hover:bg-navy-50"
                    )}
                  >
                    {item.icon}
                  </Button>
                </Link>
              </>
              
            })}
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
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </div>
      
      <div className={isCollapsed ? "w-[70px]" : "w-64"} />
    </>
  );
};

export default UserSidebar;
