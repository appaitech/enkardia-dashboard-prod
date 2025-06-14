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
  Area,
  AreaChart
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
import MonthSelector from "@/components/ProfitAndLoss/MonthSelector";
import MonthComparisonChart from "@/components/ProfitAndLoss/MonthComparisonChart";

interface FinancialDashboardProps {
  businessId: string;
}

// Define correct Position type for Recharts
type Position = 'top' | 'right' | 'bottom' | 'left' | 'center' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideTopRight' | 'insideBottomLeft' | 'insideBottomRight' | 'start' | 'end' | 'inside';

// Define CSS position type for styling
type CSSPosition = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ businessId }) => {
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [comparisonMonths, setComparisonMonths] = useState<string[]>([]);

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

  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center p-8">
  //       <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
  //       <p className="mt-4 text-slate-500">Loading financial data...</p>
  //     </div>
  //   );
  // }

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
  const availableMonths = revenueTrendData.map(item => item.month);

  // // Set default selected month if not set - fix the infinite loop by removing selectedMonth from dependencies
  // React.useEffect(() => {
  //   if (availableMonths.length > 0 && !selectedMonth) {
  //     setSelectedMonth(availableMonths[availableMonths.length - 1]); // Select the latest month
  //   }
  // }, [availableMonths.length]); // Only depend on the length, not the actual selectedMonth


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
                  position: "absolute" as CSSPosition, 
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

  return (
    <div className=" bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
