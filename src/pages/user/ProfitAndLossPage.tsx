import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getProfitAndLossData, 
  getMonthlyProfitAndLossData,
  getVisualDashboardData,
  getAnnualComparisonData,
  getQuarterlyBreakdownData,
  getDepartmentComparisonData,
  getCustomDateRangeData,
  getCashVsAccrualData,
  FinancialDataType,
  getDefaultStartDate,
  getDefaultEndDate,
  getCurrentDate,
  getOneYearAgoDate,
  getFirstDayLastQuarter
} from "@/services/financialService";
import { getUserClientBusinesses, getSelectedClientBusinessId, saveSelectedClientBusinessId } from "@/services/userService";
import ProfitAndLossSummary from "@/components/ProfitAndLoss/ProfitAndLossSummary";
import ProfitAndLossTable from "@/components/ProfitAndLoss/ProfitAndLossTable";
import ProfitAndLossChart from "@/components/ProfitAndLoss/ProfitAndLossChart";
import MonthlyProfitAndLossTable from "@/components/ProfitAndLoss/MonthlyProfitAndLossTable";
import VisualDashboard from "@/components/ProfitAndLoss/VisualDashboard";
import AnnualComparisonView from "@/components/ProfitAndLoss/AnnualComparisonView";
import QuarterlyBreakdownView from "@/components/ProfitAndLoss/QuarterlyBreakdownView";
import DepartmentComparisonView from "@/components/ProfitAndLoss/DepartmentComparisonView";
import CustomDateRangeView from "@/components/ProfitAndLoss/CustomDateRangeView";
import CashVsAccrualView from "@/components/ProfitAndLoss/CashVsAccrualView";
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCcw, 
  BarChart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CalendarIcon,
  CalendarDays,
  Columns3,
  FileText,
  Grid3X3,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import ClientBusinessSelector from "@/components/ClientBusinessSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ProfitAndLossPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(getSelectedClientBusinessId());
  const [activeTab, setActiveTab] = useState<string>("current-year");
  const isMobile = useIsMobile();
  
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  const [quarterlyStartDate, setQuarterlyStartDate] = useState<string>(getFirstDayLastQuarter());
  const [quarterlyEndDate, setQuarterlyEndDate] = useState<string>(getCurrentDate());
  const [customStartDate, setCustomStartDate] = useState<string>(getDefaultStartDate());
  const [customEndDate, setCustomEndDate] = useState<string>(getCurrentDate());
  const [cashVsAccrualDate, setCashVsAccrualDate] = useState<string>(getCurrentDate());
  const [selectedTrackingCategoryId, setSelectedTrackingCategoryId] = useState<string>('');

  const { 
    data: clientBusinesses,
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses,
  } = useQuery({
    queryKey: ["user-client-businesses", user?.id],
    queryFn: () => getUserClientBusinesses(user?.id || ""),
    enabled: !!user?.id,
  });

  const {
    data: plData,
    isLoading: isLoadingPL,
    isError: isErrorPL,
    refetch: refetchPL
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.BASIC_CURRENT_YEAR, startDate, endDate],
    queryFn: () => getProfitAndLossData(selectedBusinessId, startDate, endDate),
    enabled: !!selectedBusinessId && activeTab === "current-year",
  });

  const {
    data: monthlyData,
    isLoading: isLoadingMonthly,
    isError: isErrorMonthly,
    refetch: refetchMonthly
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.MONTHLY_BREAKDOWN, startDate, endDate],
    queryFn: () => getMonthlyProfitAndLossData(selectedBusinessId, startDate, endDate, 6),
    enabled: !!selectedBusinessId && activeTab === "monthly",
  });

  const {
    data: visualData,
    isLoading: isLoadingVisual,
    isError: isErrorVisual,
    refetch: refetchVisual
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.VISUAL_DASHBOARD, startDate, endDate],
    queryFn: () => getVisualDashboardData(selectedBusinessId, startDate, endDate),
    enabled: !!selectedBusinessId && activeTab === "visual",
  });

  const {
    data: annualData,
    isLoading: isLoadingAnnual,
    isError: isErrorAnnual,
    refetch: refetchAnnual
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.ANNUAL_COMPARISON],
    queryFn: () => getAnnualComparisonData(selectedBusinessId),
    enabled: !!selectedBusinessId && activeTab === "annual",
  });

  const {
    data: quarterlyData,
    isLoading: isLoadingQuarterly,
    isError: isErrorQuarterly,
    refetch: refetchQuarterly
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.QUARTERLY_BREAKDOWN, quarterlyStartDate, quarterlyEndDate],
    queryFn: () => getQuarterlyBreakdownData(selectedBusinessId, quarterlyStartDate, quarterlyEndDate),
    enabled: !!selectedBusinessId && activeTab === "quarterly",
  });

  const {
    data: departmentData,
    isLoading: isLoadingDepartment,
    isError: isErrorDepartment,
    refetch: refetchDepartment
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.DEPARTMENT_COMPARISON, selectedTrackingCategoryId],
    queryFn: () => getDepartmentComparisonData(selectedBusinessId, selectedTrackingCategoryId),
    enabled: !!selectedBusinessId && activeTab === "department" && !!selectedTrackingCategoryId,
  });

  const {
    data: customDateData,
    isLoading: isLoadingCustomDate,
    isError: isErrorCustomDate,
    refetch: refetchCustomDate
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.CUSTOM_DATE_RANGE, customStartDate, customEndDate],
    queryFn: () => getCustomDateRangeData(selectedBusinessId, customStartDate, customEndDate),
    enabled: !!selectedBusinessId && activeTab === "custom-date",
  });

  const {
    data: cashVsAccrualData,
    isLoading: isLoadingCashVsAccrual,
    isError: isErrorCashVsAccrual,
    refetch: refetchCashVsAccrual
  } = useQuery({
    queryKey: ["profit-and-loss", selectedBusinessId, FinancialDataType.CASH_VS_ACCRUAL, cashVsAccrualDate],
    queryFn: () => getCashVsAccrualData(selectedBusinessId, cashVsAccrualDate),
    enabled: !!selectedBusinessId && activeTab === "cash-vs-accrual",
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleTrackingCategorySelect = (categoryId: string) => {
    setSelectedTrackingCategoryId(categoryId);
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "current-year":
        refetchPL();
        break;
      case "monthly":
        refetchMonthly();
        break;
      case "visual":
        refetchVisual();
        break;
      case "annual":
        refetchAnnual();
        break;
      case "quarterly":
        refetchQuarterly();
        break;
      case "department":
        refetchDepartment();
        break;
      case "custom-date":
        refetchCustomDate();
        break;
      case "cash-vs-accrual":
        refetchCashVsAccrual();
        break;
    }
  };

  const handleFromDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(format(date, 'yyyy-MM-dd'));
      setFromDateOpen(false);
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(format(date, 'yyyy-MM-dd'));
      setToDateOpen(false);
    }
  };

  const handleQuarterlyFromDateChange = (date: Date | undefined) => {
    if (date) {
      setQuarterlyStartDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleQuarterlyToDateChange = (date: Date | undefined) => {
    if (date) {
      setQuarterlyEndDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleCustomFromDateChange = (date: Date | undefined) => {
    if (date) {
      setCustomStartDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleCustomToDateChange = (date: Date | undefined) => {
    if (date) {
      setCustomEndDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleCashVsAccrualDateChange = (date: Date | undefined) => {
    if (date) {
      setCashVsAccrualDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const isLoading = isLoadingBusinesses || 
    (isLoadingPL && activeTab === "current-year" && !!selectedBusinessId) ||
    (isLoadingMonthly && activeTab === "monthly" && !!selectedBusinessId) ||
    (isLoadingVisual && activeTab === "visual" && !!selectedBusinessId) ||
    (isLoadingAnnual && activeTab === "annual" && !!selectedBusinessId) ||
    (isLoadingQuarterly && activeTab === "quarterly" && !!selectedBusinessId) ||
    (isLoadingDepartment && activeTab === "department" && !!selectedBusinessId) ||
    (isLoadingCustomDate && activeTab === "custom-date" && !!selectedBusinessId) ||
    (isLoadingCashVsAccrual && activeTab === "cash-vs-accrual" && !!selectedBusinessId);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/financial/profit-loss" />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center pt-14 md:pt-0">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasError = isErrorBusinesses || 
    (isErrorPL && activeTab === "current-year" && !!selectedBusinessId) ||
    (isErrorMonthly && activeTab === "monthly" && !!selectedBusinessId) ||
    (isErrorVisual && activeTab === "visual" && !!selectedBusinessId) ||
    (isErrorAnnual && activeTab === "annual" && !!selectedBusinessId) ||
    (isErrorQuarterly && activeTab === "quarterly" && !!selectedBusinessId) ||
    (isErrorDepartment && activeTab === "department" && !!selectedBusinessId) ||
    (isErrorCustomDate && activeTab === "custom-date" && !!selectedBusinessId) ||
    (isErrorCashVsAccrual && activeTab === "cash-vs-accrual" && !!selectedBusinessId);

  if (hasError) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/financial/profit-loss" />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center pt-14 md:pt-0">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
            <p className="mt-2 text-slate-500">There was a problem loading your financial data</p>
            <Button onClick={handleRefresh} className="mt-4">
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
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/financial/profit-loss" />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center pt-14 md:pt-0">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto" />
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

  const renderDateRangeSelectors = () => {
    switch (activeTab) {
      case "current-year":
      case "monthly":
      case "visual":
        return (
          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="flex items-end gap-2">
              <div className="grid items-center gap-1.5">
                <Label htmlFor="from-date">From</Label>
                <div className="flex">
                  <Input
                    id="from-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-r-none w-[130px]"
                  />
                  <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-l-none border-l-0 h-10">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={handleFromDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid items-center gap-1.5">
                <Label htmlFor="to-date">To</Label>
                <div className="flex">
                  <Input 
                    id="to-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-r-none w-[130px]"
                  />
                  <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-l-none border-l-0 h-10">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={handleToDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center space-x-2 mr-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-navy-800">
                  Connected to Xero
                </span>
              </div>
              
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="bg-white hover:bg-navy-50 border-navy-200"
              >
                <RefreshCcw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        );
      case "quarterly":
        return (
          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="flex items-end gap-2">
              <div className="grid items-center gap-1.5">
                <Label htmlFor="quarterly-from-date">From</Label>
                <div className="flex">
                  <Input
                    id="quarterly-from-date"
                    value={quarterlyStartDate}
                    onChange={(e) => setQuarterlyStartDate(e.target.value)}
                    className="rounded-r-none w-[130px]"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-l-none border-l-0 h-10">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quarterlyStartDate ? new Date(quarterlyStartDate) : undefined}
                        onSelect={handleQuarterlyFromDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid items-center gap-1.5">
                <Label htmlFor="quarterly-to-date">To</Label>
                <div className="flex">
                  <Input 
                    id="quarterly-to-date"
                    value={quarterlyEndDate}
                    onChange={(e) => setQuarterlyEndDate(e.target.value)}
                    className="rounded-r-none w-[130px]"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-l-none border-l-0 h-10">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quarterlyEndDate ? new Date(quarterlyEndDate) : undefined}
                        onSelect={handleQuarterlyToDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="bg-white hover:bg-navy-50 border-navy-200"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        );
      case "custom-date":
        return (
          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="flex items-end gap-2">
              <div className="grid items-center gap-1.5">
                <Label htmlFor="custom-from-date">From</Label>
                <div className="flex">
                  <Input
                    id="custom-from-date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="rounded-r-none w-[130px]"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-l-none border-l-0 h-10">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customStartDate ? new Date(customStartDate) : undefined}
                        onSelect={handleCustomFromDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid items-center gap-1.5">
                <Label htmlFor="custom-to-date">To</Label>
                <div className="flex">
                  <Input 
                    id="custom-to-date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="rounded-r-none w-[130px]"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-l-none border-l-0 h-10">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customEndDate ? new Date(customEndDate) : undefined}
                        onSelect={handleCustomToDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="bg-white hover:bg-navy-50 border-navy-200"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        );
      case "cash-vs-accrual":
        return (
          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="grid items-center gap-1.5">
              <Label htmlFor="cash-accrual-date">Report Date</Label>
              <div className="flex">
                <Input
                  id="cash-accrual-date"
                  value={cashVsAccrualDate}
                  onChange={(e) => setCashVsAccrualDate(e.target.value)}
                  className="rounded-r-none w-[130px]"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-l-none border-l-0 h-10">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={cashVsAccrualDate ? new Date(cashVsAccrualDate) : undefined}
                      onSelect={handleCashVsAccrualDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="bg-white hover:bg-navy-50 border-navy-200"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="flex items-center space-x-2 mr-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-navy-800">
                Connected to Xero
              </span>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-navy-50 border-navy-200"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        );
    }
  };

  const noDataMessage = (tabName: string) => (
    <Card className="bg-navy-50/30 border-navy-100">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-navy-400" />
        <h2 className="mt-4 text-lg font-semibold text-navy-700">
          No {tabName} Data Available
        </h2>
        <p className="mt-2 text-navy-600/80">
          There is no {tabName.toLowerCase()} data for this business
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
  <UserSidebar activePath="/user/financial/profit-loss" />
  <div className="flex-1 w-full">
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="bg-navy-100/50 p-3 rounded-xl">
            <BarChart className="h-8 w-8 text-navy-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy-800">
              Profit & Loss
            </h1>
            <p className="text-navy-600/80 mt-1">
              Track your financial performance
            </p>
          </div>
        </div>
        
        {validBusinesses.length > 0 && (
          <div className="w-full md:w-[300px]">
            <ClientBusinessSelector 
              clientBusinesses={validBusinesses}
              selectedBusinessId={selectedBusinessId}
              onBusinessSelect={handleBusinessSelect}
              className="w-full"
            />
          </div>
        )}
      </div>

      {selectedBusiness && (
        <Card className="mb-8 bg-white border-navy-100">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-navy-800">
                  {selectedBusiness.name}
                </h2>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="bg-navy-50 text-navy-700 border-navy-200">
                    {selectedBusiness.industry || "No industry specified"}
                  </Badge>
                </div>
              </div>
              
              {renderDateRangeSelectors()}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs 
        defaultValue="current-year" 
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex items-center justify-start rounded-md bg-navy-50/50 p-1 text-navy-600 min-w-full md:min-w-0 w-auto">
            <TabsTrigger 
              value="current-year"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">Current Year</span>
              <span className="md:hidden">Current</span>
            </TabsTrigger>
            <TabsTrigger 
              value="visual"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Visual Dashboard</span>
              <span className="md:hidden">Visual</span>
            </TabsTrigger>
            <TabsTrigger 
              value="annual"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden md:inline">Annual Comparison</span>
              <span className="md:hidden">Annual</span>
            </TabsTrigger>
            <TabsTrigger 
              value="quarterly"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <Columns3 className="h-4 w-4" />
              <span className="hidden md:inline">Quarterly Breakdown</span>
              <span className="md:hidden">Quarterly</span>
            </TabsTrigger>
            <TabsTrigger 
              value="department"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden md:inline">Department Comparison</span>
              <span className="md:hidden">Dept.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="custom-date"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Custom Date Range</span>
              <span className="md:hidden">Custom</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cash-vs-accrual"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Cash vs Accrual</span>
              <span className="md:hidden">Cash/Accrual</span>
            </TabsTrigger>
            <TabsTrigger 
              value="monthly"
              className="data-[state=active]:bg-white data-[state=active]:text-navy-800 data-[state=active]:shadow-sm gap-2 whitespace-nowrap"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Monthly Breakdown</span>
              <span className="md:hidden">Monthly</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="current-year" className="space-y-6">
          {plData && (
            <div className="grid gap-6">
              <ProfitAndLossSummary report={plData.Reports[0]} />

              <Card className="bg-white border-navy-100">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-navy-800">
                    Revenue & Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="min-w-[500px] max-w-[900px] mx-auto">
                    <ProfitAndLossChart rows={plData.Reports[0].Rows} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-navy-100">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-navy-800">
                    Detailed Statement
                  </CardTitle>
                  <CardDescription>
                    {startDate} to {endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="max-w-[800px] mx-auto">
                    <ProfitAndLossTable 
                      rows={plData.Reports[0].Rows} 
                      period={plData.Reports[0].ReportDate} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="monthly">
          {activeTab === "monthly" && !monthlyData && noDataMessage("Monthly")}
          
          {monthlyData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-navy-800">
                  Monthly Breakdown
                </CardTitle>
                <CardDescription>
                  {startDate} to {endDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[700px]">
                  <MonthlyProfitAndLossTable data={monthlyData} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="visual">
          {activeTab === "visual" && !visualData && noDataMessage("Visual Dashboard")}
          
          {visualData && (
            <VisualDashboard data={visualData} />
          )}
        </TabsContent>

        <TabsContent value="annual">
          {activeTab === "annual" && !annualData && noDataMessage("Annual Comparison")}
          
          {annualData && (
            <AnnualComparisonView data={annualData} />
          )}
        </TabsContent>

        <TabsContent value="quarterly">
          {activeTab === "quarterly" && !quarterlyData && noDataMessage("Quarterly Breakdown")}
          
          {quarterlyData && (
            <QuarterlyBreakdownView data={quarterlyData} />
          )}
        </TabsContent>

        <TabsContent value="department">
          <DepartmentComparisonView 
            data={departmentData}
            businessId={selectedBusinessId}
            onTrackingCategorySelect={handleTrackingCategorySelect}
            isLoading={isLoadingDepartment}
          />
        </TabsContent>

        <TabsContent value="custom-date">
          {activeTab === "custom-date" && !customDateData && noDataMessage("Custom Date Range")}
          
          {customDateData && (
            <CustomDateRangeView 
              data={customDateData} 
              fromDate={customStartDate}
              toDate={customEndDate}
            />
          )}
        </TabsContent>

        <TabsContent value="cash-vs-accrual">
          {activeTab === "cash-vs-accrual" && !cashVsAccrualData && noDataMessage("Cash vs Accrual")}
          
          {cashVsAccrualData && (
            <CashVsAccrualView 
              cashData={cashVsAccrualData[0]} 
              accrualData={cashVsAccrualData[1]}
              date={cashVsAccrualDate}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  </div>
</div>
  );
};

export default ProfitAndLossPage;
