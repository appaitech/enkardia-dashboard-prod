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
import { chartConfig, useIsMobile, ResponsiveChartContainer } from '@/components/ui/chart';

interface FinancialDashboardProps {
  businessId: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ businessId }) => {
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  const isMobile = useIsMobile();

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

  const TopExpensesChart = ({ data }: { data: any[] }) => {
    const isMobile = useIsMobile();
    const layout = isMobile ? chartConfig.mobileLayout : chartConfig.desktopLayout;

    const renderCustomLabel = ({ 
      cx, 
      cy, 
      midAngle, 
      innerRadius, 
      outerRadius, 
      percent, 
      value 
    }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
      // Only show label if percentage is greater than 5%
      if (percent < 0.05) return null;

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Expenses</CardTitle>
        </CardHeader>
        <CardContent className="relative overflow-visible px-0">
          <ResponsiveChartContainer height={isMobile ? 300 : 400}>
            <PieChart margin={layout.margin}>
              <Pie
                data={data}
                cx={isMobile ? "50%" : "40%"}
                cy="50%"
                outerRadius={isMobile ? 100 : 160}
                innerRadius={isMobile ? 40 : 60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Legend
                {...layout.legendProps}
                content={({ payload }) => (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b px-4 pt-4">
                      Expense Categories
                    </h4>
                    <div className="px-4 pb-4 space-y-3">
                      {payload?.map((entry: any, index: number) => {
                        const item = data.find(d => d.name === entry.value);
                        const percentage = (item?.value || 0) / data.reduce((sum, i) => sum + i.value, 0) * 100;
                        return (
                          <div key={`item-${index}`} className="flex items-center gap-3">
                            <span 
                              className="w-3 h-3 rounded-full shrink-0" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="flex-1 text-sm text-slate-700">
                              {entry.value}
                            </span>
                            <div className="text-right">
                              <div className="font-mono text-sm text-slate-900 tabular-nums font-medium">
                                {formatCurrency(item?.value || 0)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-3 mt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-900">Total</span>
                          <span className="font-mono text-sm font-medium text-slate-900">
                            {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveChartContainer>
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

          {/* Summary Cards */}
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

          {/* Revenue Trend Chart */}
          <Card className="border-navy-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-navy-800">
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveChartContainer height={isMobile ? 300 : 400}>
                <BarChart
                  data={revenueTrendData}
                  margin={isMobile ? 
                    { top: 20, right: 20, bottom: 60, left: 40 } : 
                    { top: 20, right: 340, bottom: 20, left: 40 }
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 80 : 60}
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    {...(isMobile ? chartConfig.mobileLayout : chartConfig.desktopLayout).legendProps}
                    content={({ payload }) => (
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                        <div className="p-4 space-y-3">
                          {payload?.map((entry: any) => (
                            <div key={entry.value} className="flex items-center gap-3">
                              <span 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-slate-700">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#0088FE"
                    radius={[4, 4, 0, 0]}
                  >
                    {/* Add value labels on top of bars */}
                    {revenueTrendData.map((entry, index) => (
                      <text
                        key={`label-${index}`}
                        x={0}
                        y={0}
                        dy={-10}
                        fill="#1a365d"
                        fontSize={isMobile ? 12 : 14}
                        fontWeight="500"
                        textAnchor="middle"
                      >
                        {formatCurrency(entry.revenue)}
                      </text>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChartContainer>
            </CardContent>
          </Card>

          {/* Top Expenses */}
          <TopExpensesChart data={expensesData} />
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
