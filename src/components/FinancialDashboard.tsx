
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis,
  CartesianGrid, 
  Tooltip, 
  Legend
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Loader2,
  BarChart3,
  RefreshCcw,
  CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  getVisualDashboardData,
  getFinancialSummary,
  getMonthlyProfitAndLossData,
  getDefaultStartDate,
  getDefaultEndDate
} from "@/services/financialService";
import { toast } from "sonner";

interface FinancialDashboardProps {
  businessId: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ businessId }) => {
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  // Fetch monthly report data
  const { 
    data: monthlyData, 
    isLoading: isLoadingMonthly, 
    isError: isMonthlyError,
    refetch: refetchMonthly 
  } = useQuery({
    queryKey: ["monthly-financial-data", businessId, startDate, endDate],
    queryFn: () => getMonthlyProfitAndLossData(businessId, startDate, endDate, 6),
    enabled: !!businessId,
  });

  // Fetch visual dashboard data
  const { 
    data: visualData, 
    isLoading: isLoadingVisual, 
    isError: isVisualError,
    refetch: refetchVisual 
  } = useQuery({
    queryKey: ["visual-dashboard", businessId, startDate, endDate],
    queryFn: () => getVisualDashboardData(businessId, startDate, endDate),
    enabled: !!businessId,
  });

  // Fetch financial summary
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isError: isSummaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ["financial-summary", businessId, startDate, endDate],
    queryFn: () => getFinancialSummary(businessId),
    enabled: !!businessId,
  });

  const handleRefresh = () => {
    refetchMonthly();
    refetchVisual();
    refetchSummary();
    toast.success("Financial data refreshed");
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

  const isLoading = isLoadingMonthly || isLoadingVisual || isLoadingSummary;
  const isError = isMonthlyError || isVisualError || isSummaryError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-500">Loading financial data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="mt-4 text-slate-500">There was an error loading financial data</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!visualData || !summaryData || !monthlyData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-slate-300" />
        <p className="mt-4 text-slate-500">No financial data available</p>
      </div>
    );
  }

  // Prepare data for revenue trend chart from monthly data
  const processMonthlyData = () => {
    if (!monthlyData || !monthlyData.Reports || !monthlyData.Reports[0]) {
      return [];
    }

    // Extract the column headers (months) from the report
    const report = monthlyData.Reports[0];
    const headers = report.Rows[0]?.Cells?.map(cell => cell.Value) || [];
    
    // Skip the first header (usually "Account")
    const monthHeaders = headers.slice(1);
    
    // Find the "Total Income" row for revenue
    const incomeSection = report.Rows.find(section => section.Title === 'Income' || section.Title === 'Revenue');
    const totalIncomeRow = incomeSection?.Rows?.find(row => 
      row.RowType === 'SummaryRow' || row.Cells?.[0]?.Value?.includes('Total')
    );
    
    if (!totalIncomeRow || !totalIncomeRow.Cells) {
      return [];
    }
    
    // Map the values to the chart data format
    return monthHeaders.map((month, index) => {
      // Skip the first cell (label) and map the value for this month
      const value = totalIncomeRow.Cells?.[index + 1]?.Value || '0';
      // Remove commas and convert to number
      const revenue = parseFloat(value.replace(/,/g, ''));
      
      return {
        month,
        revenue
      };
    });
  };

  // Prepare data for expenses pie chart
  const processExpensesData = () => {
    if (!visualData || !visualData.Reports || !visualData.Reports[0]) {
      return [];
    }

    const report = visualData.Reports[0];
    const expensesSection = report.Rows.find(section => section.Title === 'Less Operating Expenses');
    
    if (!expensesSection || !expensesSection.Rows) {
      return [];
    }

    return expensesSection.Rows
      .filter(row => row.RowType === 'Row')
      .map(row => ({
        name: row.Cells?.[0]?.Value || '',
        value: parseFloat((row.Cells?.[1]?.Value || '0').replace(/,/g, ''))
      }))
      .sort((a, b) => b.value - a.value) // Sort by highest expense first
      .slice(0, 5); // Get top 5 expenses
  };

  const revenueTrendData = processMonthlyData();
  const expensesData = processExpensesData();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Extract the report date range
  const reportPeriod = visualData.Reports[0]?.ReportDate || `${startDate} to ${endDate}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">Financial Dashboard</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-end gap-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="from-date">From Date</Label>
              <div className="flex">
                <Input
                  id="from-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-r-none"
                />
                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-l-none border-l-0">
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
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="to-date">To Date</Label>
              <div className="flex">
                <Input 
                  id="to-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-r-none"
                />
                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-l-none border-l-0">
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
            
            <Button onClick={handleRefresh} className="mb-1">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</div>
            <div className="text-sm text-slate-500">Total Income</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingDown className="mr-2 h-5 w-5 text-red-600" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.totalExpenses)}</div>
            <div className="text-sm text-slate-500">Total Expenses</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.netProfit)}</div>
            <div className="text-sm text-slate-500">
              Margin: {summaryData.grossMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monthly Revenue Trend</CardTitle>
          <CardDescription>
            {reportPeriod}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  name="Revenue" 
                  fill="#0088FE" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
