
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserSidebar from "@/components/UserSidebar";
import { getUserClientBusinesses, getSelectedClientBusinessId, saveSelectedClientBusinessId } from "@/services/userService";
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

const UserDashboard = () => {
  const { user } = useAuth();
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar activePath={location.pathname} />
      
      <div className="flex-1">
        <div className="p-4 md:p-8">
          <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="flex items-center space-x-3">
                <UserCircle className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  Welcome, {user?.name || 'User'}
                </h1>
              </div>
              <p className="text-slate-500 mt-2 text-sm">
                {user?.accountType === 'CONSOLE' 
                  ? 'Console Administrator Dashboard' 
                  : `${user?.role === 'ADMIN' ? 'Client Business Admin' : 'Client User'} Dashboard`}
              </p>
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
          
          <div className="mb-8">
            {selectedBusiness.tenant_id ? (
              <div className={isMobile ? "overflow-x-auto" : ""}>
                <div className={isMobile ? "min-w-[600px]" : ""}>
                  <FinancialDashboard businessId={selectedBusiness.id} />
                </div>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <AlertTriangle className="h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-slate-500">No financial data available</p>
                  <p className="text-sm text-slate-400 text-center mt-1">
                    This client isn't connected to Xero yet. Connect to Xero to see financial data.
                  </p>
                </div>
              </Card>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-500 py-4">
                No documents available
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Browse Documents
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-500 py-4">
                No recent activity to display
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Activity
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBusiness && (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">Contact Name</span>
                      <p className="text-sm">{selectedBusiness.contact_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Email</span>
                      <p className="text-sm break-words">{selectedBusiness.email}</p>
                    </div>
                    {selectedBusiness.phone && (
                      <div>
                        <span className="text-xs text-slate-500">Phone</span>
                        <p className="text-sm">{selectedBusiness.phone}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
