import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserSidebar from "@/components/UserSidebar";
import { getUserClientBusinesses, getSelectedClientBusinessId, saveSelectedClientBusinessId } from "@/services/userService";
import { fetchClientTasks } from "@/services/taskService";
import { 
  Building, 
  Boxes, 
  FileText, 
  Calendar, 
  Settings, 
  ChevronRight,
  Loader2,
  RefreshCcw,
  AlertTriangle,
  UserCircle
} from "lucide-react";
import ClientBusinessSelector from "@/components/ClientBusinessSelector";
import FinancialDashboard from "@/components/FinancialDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import SarsRequestTimer from '@/components/SarsRequestTimer';
import { DataModel, useFinancialStore } from '@/store/financialStore';
import TaskDashboard from "@/components/dashboard/TaskDashboard";

import StoreDemo from "@/components/StoreDemo";

import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  // const { user } = useAuth();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isLoadingUser } = useAuth();
  const location = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(getSelectedClientBusinessId());
  const isMobile = useIsMobile();

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
  
  const { 
    data: tasks, 
    isLoading: isLoadingTasks, 
    isError: isErrorTasks, 
    refetch: refetchTasks 
  } = useQuery({
    queryKey: ['tasks', selectedBusinessId],
    queryFn: () => fetchClientTasks(selectedBusinessId || ''),
    enabled: !!selectedBusinessId
  });

  console.log('tasks', tasks)

  useEffect(() => {
    if (clientBusinesses?.length && !selectedBusinessId) {
      const validBusinesses = clientBusinesses.filter(business => business !== null);
      if (validBusinesses.length > 0) {
        const firstBusinessId = validBusinesses[0].id;
        setSelectedBusinessId(firstBusinessId);
        saveSelectedClientBusinessId(firstBusinessId);
      }
    }
  }, [clientBusinesses, selectedBusinessId]);

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    saveSelectedClientBusinessId(businessId);
  };

  const isLoading = isLoadingBusinesses;
  
  const isError = isBusinessError;

  // Test browser state START
  const { data, setData } = useFinancialStore();
  
  console.log('data', data);    

  useEffect(() => {
    if (selectedBusinessId) {

      const dataModel: DataModel = {
        selectedClientId: selectedBusinessId
      };
      console.log('dataModel', dataModel);
      setData(dataModel);
    }
  }, [selectedBusinessId]);
  // Test browser state END


  // Add SARS requests data (later this would come from your backend)
  const sarsRequests = [
    {
      id: 1,
      requestDate: new Date('2024-03-01'),
      status: 'pending' as const,
      documentType: 'Tax Clearance Certificate',
      reference: 'SARS-2024-001',
    },
    {
      id: 2,
      requestDate: new Date('2024-02-15'),
      status: 'completed' as const,
      documentType: 'VAT Registration',
      reference: 'SARS-2024-002',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar activePath={location.pathname} />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar activePath={location.pathname} />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
            <p className="mt-2 text-slate-500">There was a problem loading your dashboard data</p>
            <Button onClick={() => {
              refetchBusinesses();
            }} className="mt-4">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validBusinesses = clientBusinesses?.filter(business => business !== null) || [];
  
  if (validBusinesses.length === 0) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar activePath={location.pathname} />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <Building className="h-12 w-12 text-slate-300 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">No Client Businesses</h2>
            <p className="mt-2 text-slate-500">You don't have access to any client businesses yet</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedBusiness = selectedBusinessId 
    ? validBusinesses.find(b => b && b.id === selectedBusinessId) 
    : validBusinesses[0];
  
  if (!selectedBusiness) {
    const firstBusinessId = validBusinesses[0].id;
    setSelectedBusinessId(firstBusinessId);
    saveSelectedClientBusinessId(firstBusinessId);
    return null;
  }

  console.log('UserDashboard pages isLoadingUser', isLoadingUser);
  console.log('UserDashboard pages user', user);


  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar activePath={location.pathname} />
      
      <div className="flex-1">
        <div className="p-4 md:p-8">
          <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              {
                isLoadingUser === false && 
                <>
                  <div className="flex items-center space-x-3">
                    <UserCircle className="h-8 w-8 text-blue-600" />
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                      Welcome, {user?.user_metadata?.name || 'User'}
                    </h1>
                  </div>
                  <p className="text-slate-500 mt-2 text-sm">
                    {user?.accountType === 'CONSOLE' 
                      ? 'Console Administrator Dashboard' 
                      : `${user?.role === 'ADMIN' ? 'Client Business Admin' : 'Client User'} Dashboard`}
                  </p>
                </>
              }
              
            </div>
            
            {validBusinesses.length > 0 && (
              <div className="w-full md:w-auto">
                <ClientBusinessSelector 
                  clientBusinesses={validBusinesses}
                  selectedBusinessId={selectedBusinessId}
                  onBusinessSelect={handleBusinessSelect}
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">{selectedBusiness.name}</h2>
            <div className="flex items-center mt-1 text-sm text-slate-500">
              <span>{selectedBusiness.industry || "No industry specified"}</span>
            </div>
          </div>

          <TaskDashboard 
            tasks={tasks}
            isLoadingTasks={isLoadingTasks}
            isErrorTasks={isErrorTasks}
            refetchTasks={refetchTasks}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/user/financial/profit-loss')}
          >
            View Profit & Loss
          </Button>
          
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
