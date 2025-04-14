
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
  Legend,
  AreaChart,
  Area
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
import { chartConfig, useIsMobile, ResponsiveChartContainer } from '@/components/ui/chart';

interface FinancialDashboardProps {
  businessId: string;
}

// Define correct Position type for Recharts
type Position = 'top' | 'right' | 'bottom' | 'left' | 'center' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideTopRight' | 'insideBottomLeft' | 'insideBottomRight' | 'start' | 'end' | 'inside';

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ businessId }) => {
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  const isMobile = useIsMobile();

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

  const processMonthlyData = () => {
    if (!monthlyData || !monthlyData.Reports || !monthlyData.Reports[0]) {
      return [];
    }

    const report = monthlyData.Reports[0];
    const headers = report.Rows[0]?.Cells?.map(cell => cell.Value) || [];
    
    const monthHeaders = headers.slice(1);
    
    const incomeSection = report.Rows.find(section => section.Title === 'Income' || section.Title === 'Revenue');
    const totalIncomeRow = incomeSection?.Rows?.find(row => 
      row.RowType === 'SummaryRow' || row.Cells?.[0]?.Value?.includes('Total')
    );
    
    if (!totalIncomeRow || !totalIncomeRow.Cells) {
      return [];
    }
    
    return monthHeaders.map((month, index) => {
      const value = totalIncomeRow.Cells?.[index + 1]?.Value || '0';
      const revenue = parseFloat(value.replace(/,/g, ''));
      
      return {
        month,
        revenue
      };
    });
  };

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
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const revenueTrendData = processMonthlyData();
  const expensesData = processExpensesData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const reportPeriod = visualData.Reports[0]?.ReportDate || `${startDate} to ${endDate}`;

  const renderTopExpensesLegend = ({ payload }: any) => (
    <div className="p-4 bg-white rounded-lg shadow-sm mt-4">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">Top Expenses</h4>
      <div className="space-y-2">
        {payload?.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center">
            <span 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1 text-sm truncate">
              {entry.value}
            </span>
            <span className="text-xs font-mono text-slate-600">
              {formatCurrency(expensesData.find(d => d.name === entry.value)?.value || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRevenueTrendLegend = ({ payload }: any) => (
    <div className="flex mt-4 justify-center flex-wrap gap-4">
      {payload?.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center">
          <span 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  const TopExpensesChart = ({ data }: { data: any[] }) => {
    if (data.length === 0) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Expenses</CardTitle>
          <CardDescription>Largest expenses in the period</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                content={renderTopExpensesLegend}
                align="right" 
                verticalAlign="middle" 
                layout="vertical"
                wrapperStyle={{ 
                  position: "absolute" as PositionType, 
                  right: 0, 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  backgroundColor: "white",
                  padding: "8px",
                  borderRadius: "4px",
                  width: "180px",
                  border: "1px solid #eee",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  zIndex: 100
                }}
              />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const RevenueTrendChart = ({ data }: { data: any[] }) => {
    if (data.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
          <CardDescription>Last 6 months revenue</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fill="#93c5fd" 
                activeDot={{ r: 8 }} 
              />
              <Legend 
                content={renderRevenueTrendLegend}
                align="center" 
                verticalAlign="bottom"
                wrapperStyle={{ 
                  position: "absolute" as Position, 
                  left: 0,
                  right: 0,
                  bottom: -20,
                  zIndex: 100
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50/50 border border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-blue-900">
                  <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(summaryData.totalRevenue)}
                </div>
                <div className="text-sm text-blue-600">Total Income</div>
              </CardContent>
            </Card>

            <Card className="bg-red-50/50 border border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-red-900">
                  <TrendingDown className="mr-2 h-5 w-5 text-red-600" />
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(summaryData.totalExpenses)}
                </div>
                <div className="text-sm text-red-600">Total Expenses</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50/50 border border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-green-900">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(summaryData.netProfit)}
                </div>
                <div className="text-sm text-green-600">
                  Margin: {summaryData.grossMargin.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <RevenueTrendChart data={revenueTrendData} />

          <TopExpensesChart data={expensesData} />
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
