
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  FileText,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  getVisualDashboardData,
  getFinancialSummary,
  getOutstandingInvoices,
  getPaidInvoicesLastMonth
} from "@/services/financialService";

interface FinancialDashboardProps {
  businessId: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ businessId }) => {
  // Fetch visual dashboard data
  const { 
    data: visualData, 
    isLoading: isLoadingVisual, 
    isError: isVisualError,
    refetch: refetchVisual 
  } = useQuery({
    queryKey: ["visual-dashboard", businessId],
    queryFn: () => getVisualDashboardData(businessId),
    enabled: !!businessId,
  });

  // Fetch financial summary
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isError: isSummaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ["financial-summary", businessId],
    queryFn: () => getFinancialSummary(businessId),
    enabled: !!businessId,
  });

  // Fetch outstanding invoices
  const {
    data: outstandingInvoices,
    isLoading: isLoadingOutstanding,
    isError: isOutstandingError,
    refetch: refetchOutstanding
  } = useQuery({
    queryKey: ["outstanding-invoices", businessId],
    queryFn: () => getOutstandingInvoices(businessId),
    enabled: !!businessId,
  });

  // Fetch paid invoices
  const {
    data: paidInvoices,
    isLoading: isLoadingPaid,
    isError: isPaidError,
    refetch: refetchPaid
  } = useQuery({
    queryKey: ["paid-invoices", businessId],
    queryFn: () => getPaidInvoicesLastMonth(businessId),
    enabled: !!businessId,
  });

  const handleRefresh = () => {
    refetchVisual();
    refetchSummary();
    refetchOutstanding();
    refetchPaid();
  };

  const isLoading = isLoadingVisual || isLoadingSummary || isLoadingOutstanding || isLoadingPaid;
  const isError = isVisualError || isSummaryError || isOutstandingError || isPaidError;

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

  if (!visualData || !summaryData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-slate-300" />
        <p className="mt-4 text-slate-500">No financial data available</p>
      </div>
    );
  }

  // Prepare data for revenue trend chart
  const processDataForTrend = () => {
    if (!visualData || !visualData.Reports || !visualData.Reports[0]) {
      return [];
    }

    // In a real implementation, you would extract monthly data
    // For this example, we'll create sample data
    return [
      { month: 'Jan', revenue: 35000 },
      { month: 'Feb', revenue: 38500 },
      { month: 'Mar', revenue: 42000 },
      { month: 'Apr', revenue: 39000 },
      { month: 'May', revenue: 44000 },
      { month: 'Jun', revenue: 48000 },
    ];
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

  const revenueTrendData = processDataForTrend();
  const expensesData = processExpensesData();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">Financial Dashboard</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
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
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue" 
                  stroke="#0088FE" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
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

      {/* Invoices Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outstanding Invoices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-amber-500" />
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(outstandingInvoices?.total || 0)}
                </div>
                <div className="text-sm text-slate-500">
                  {outstandingInvoices?.count || 0} invoices pending
                </div>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {outstandingInvoices?.invoices && outstandingInvoices.invoices.slice(0, 3).map((invoice: any) => (
              <div key={invoice.id} className="mt-4 p-3 bg-slate-50 rounded-md">
                <div className="flex justify-between">
                  <div className="font-medium">{invoice.id}</div>
                  <div className="font-semibold">{formatCurrency(invoice.amount)}</div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-sm text-slate-500">{invoice.customer}</div>
                  <div className="text-sm text-slate-500">Due: {invoice.dueDate}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Paid Invoices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-green-500" />
              Paid Last Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(paidInvoices?.total || 0)}
                </div>
                <div className="text-sm text-slate-500">
                  {paidInvoices?.count || 0} invoices paid
                </div>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {paidInvoices?.invoices && paidInvoices.invoices.slice(0, 3).map((invoice: any) => (
              <div key={invoice.id} className="mt-4 p-3 bg-slate-50 rounded-md">
                <div className="flex justify-between">
                  <div className="font-medium">{invoice.id}</div>
                  <div className="font-semibold">{formatCurrency(invoice.amount)}</div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-sm text-slate-500">{invoice.customer}</div>
                  <div className="text-sm text-slate-500">Paid: {invoice.paidDate}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;
