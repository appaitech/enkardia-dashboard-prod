
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getProfitAndLossData, 
  getMonthlyProfitAndLossData,
  getVisualDashboardData,
  FinancialDataType
} from "@/services/financialService";
import { getUserClientBusinesses, getSelectedClientBusinessId, saveSelectedClientBusinessId } from "@/services/userService";
import ProfitAndLossSummary from "@/components/ProfitAndLoss/ProfitAndLossSummary";
import ProfitAndLossTable from "@/components/ProfitAndLoss/ProfitAndLossTable";
import ProfitAndLossChart from "@/components/ProfitAndLoss/ProfitAndLossChart";
import { Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientBusinessSelector from "@/components/ClientBusinessSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfitAndLossPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(getSelectedClientBusinessId());
  const [activeTab, setActiveTab] = useState<string>("current-year");

  // Fetch client businesses
  const { 
    data: clientBusinesses,
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses,
  } = useQuery({
    queryKey: ["user-client-businesses", user?.id],
    queryFn: () => getUserClientBusinesses(user?.id || ""),
    enabled: !!user?.id,
  });

  // Fetch current financial year data
  const {
    data: plData,
    isLoading: isLoadingPL,
    isError: isErrorPL,
    refetch: refetchPL
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.BASIC_CURRENT_YEAR],
    queryFn: () => getProfitAndLossData(selectedBusinessId),
    enabled: !!selectedBusinessId,
  });

  // Fetch monthly breakdown data
  const {
    data: monthlyData,
    isLoading: isLoadingMonthly,
    isError: isErrorMonthly,
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.MONTHLY_BREAKDOWN],
    queryFn: () => getMonthlyProfitAndLossData(selectedBusinessId),
    enabled: !!selectedBusinessId && activeTab === "monthly",
  });

  // Fetch visual dashboard data
  const {
    data: visualData,
    isLoading: isLoadingVisual,
    isError: isErrorVisual,
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.VISUAL_DASHBOARD],
    queryFn: () => getVisualDashboardData(selectedBusinessId),
    enabled: !!selectedBusinessId && activeTab === "visual",
  });

  // Set the first business as selected when data loads if none is selected
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

  // Handle business selection
  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    saveSelectedClientBusinessId(businessId);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Loading state
  const isLoading = isLoadingBusinesses || 
    (isLoadingPL && activeTab === "current-year" && !!selectedBusinessId) ||
    (isLoadingMonthly && activeTab === "monthly" && !!selectedBusinessId) ||
    (isLoadingVisual && activeTab === "visual" && !!selectedBusinessId);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/financial/profit-loss" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  const hasError = isErrorBusinesses || 
    (isErrorPL && activeTab === "current-year" && !!selectedBusinessId) ||
    (isErrorMonthly && activeTab === "monthly" && !!selectedBusinessId) ||
    (isErrorVisual && activeTab === "visual" && !!selectedBusinessId);

  if (hasError) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/financial/profit-loss" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
            <p className="mt-2 text-slate-500">There was a problem loading your financial data</p>
            <Button onClick={() => refetchPL()} className="mt-4">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validBusinesses = clientBusinesses?.filter(business => business !== null) || [];
  
  // No businesses state
  if (validBusinesses.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/financial/profit-loss" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">No Client Businesses</h2>
            <p className="mt-2 text-slate-500">You don't have access to any client businesses yet</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the selected business or default to the first one
  const selectedBusiness = selectedBusinessId 
    ? validBusinesses.find(b => b && b.id === selectedBusinessId) 
    : validBusinesses[0];
  
  // Safety check to ensure we have a selected business
  if (!selectedBusiness) {
    const firstBusinessId = validBusinesses[0].id;
    setSelectedBusinessId(firstBusinessId);
    saveSelectedClientBusinessId(firstBusinessId);
    return null;
  }

  // No P&L data state for current year tab
  if (!plData && selectedBusinessId && activeTab === "current-year") {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/financial/profit-loss" />
        <div className="flex-1 p-8">
          <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <h1 className="text-3xl font-bold text-slate-800">Profit & Loss</h1>
            
            {validBusinesses.length > 0 && (
              <ClientBusinessSelector 
                clientBusinesses={validBusinesses}
                selectedBusinessId={selectedBusinessId}
                onBusinessSelect={handleBusinessSelect}
              />
            )}
          </div>
          
          <div className="flex h-[calc(100vh-200px)] items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">No Financial Data Available</h2>
              <p className="mt-2 text-slate-500">There is no profit and loss data for this business</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content with data tabs
  return (
    <div className="flex h-screen bg-slate-50">
      <UserSidebar activePath="/user/financial/profit-loss" />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-3xl font-bold text-slate-800">Profit & Loss</h1>
          
          {validBusinesses.length > 0 && (
            <ClientBusinessSelector 
              clientBusinesses={validBusinesses}
              selectedBusinessId={selectedBusinessId}
              onBusinessSelect={handleBusinessSelect}
            />
          )}
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">{selectedBusiness.name}</h2>
          <div className="flex items-center mt-1 text-sm text-slate-500">
            <span>{selectedBusiness.industry || "No industry specified"}</span>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="current-year">Current Year</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
            <TabsTrigger value="visual">Visual Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current-year">
            {plData && (
              <>
                <div className="mb-8">
                  <ProfitAndLossSummary report={plData.Reports[0]} />
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Revenue & Expenses</h2>
                  <ProfitAndLossChart rows={plData.Reports[0].Rows} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Detailed Statement</h2>
                  <ProfitAndLossTable rows={plData.Reports[0].Rows} period={plData.Reports[0].ReportDate} />
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="monthly">
            {activeTab === "monthly" && !monthlyData && (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-slate-300 mx-auto" />
                  <h2 className="mt-4 text-lg font-semibold">No Monthly Data Available</h2>
                  <p className="mt-2 text-slate-500">There is no monthly breakdown data for this business</p>
                </div>
              </div>
            )}
            
            {monthlyData && (
              <div className="text-center p-4 border rounded bg-white">
                <h3 className="text-lg font-medium">Monthly Breakdown Data Available</h3>
                <p className="text-slate-500 mt-2">
                  The monthly data is available but requires additional components to display properly.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="visual">
            {activeTab === "visual" && !visualData && (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-slate-300 mx-auto" />
                  <h2 className="mt-4 text-lg font-semibold">No Visual Dashboard Data Available</h2>
                  <p className="mt-2 text-slate-500">There is no visual dashboard data for this business</p>
                </div>
              </div>
            )}
            
            {visualData && (
              <div className="text-center p-4 border rounded bg-white">
                <h3 className="text-lg font-medium">Visual Dashboard Data Available</h3>
                <p className="text-slate-500 mt-2">
                  The visual dashboard data is available but requires additional components to display properly.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfitAndLossPage;
