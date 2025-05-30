
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
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
import { formatCurrency } from "@/lib/utils";
import { FinancialYearProfitAndLossModel } from "@/services/financialService";

interface FinancialYearChartsProps {
  data: FinancialYearProfitAndLossModel;
  selectedMonth?: string;
  comparisonMonths?: string[];
}

const FinancialYearCharts: React.FC<FinancialYearChartsProps> = ({
  data,
  selectedMonth,
  comparisonMonths = []
}) => {
  if (!data || !data.headings || data.headings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No chart data available</p>
      </div>
    );
  }

  // Process revenue data for charts
  const processRevenueData = () => {
    const revenueSection = data.grossProfitSections.find(section => 
      section.title.toLowerCase().includes('income') || 
      section.title.toLowerCase().includes('revenue')
    );
    
    if (!revenueSection) return [];

    const totalRevenueRow = revenueSection.dataRowObjects.find(row => 
      row.rowType === 'SummaryRow'
    );
    
    if (!totalRevenueRow) return [];

    return data.headings.map((month, index) => ({
      month,
      revenue: parseFloat((totalRevenueRow.rowData[index] || '0').replace(/[,$-]/g, '')) || 0
    }));
  };

  // Process top expenses data
  const processTopExpensesData = () => {
    const expensesSections = data.netProfitSections.filter(section => 
      section.title.toLowerCase().includes('expense') || 
      section.title.toLowerCase().includes('operating')
    );
    
    if (expensesSections.length === 0) return [];

    const allExpenses = [];
    expensesSections.forEach(section => {
      section.dataRowObjects.forEach(row => {
        if (row.rowType === 'Row') {
          const totalExpense = row.rowData.reduce((sum, value) => {
            const numValue = parseFloat((value || '0').replace(/[,$-]/g, '')) || 0;
            return sum + numValue;
          }, 0);
          
          if (totalExpense > 0) {
            allExpenses.push({
              name: row.rowTitle,
              value: totalExpense
            });
          }
        }
      });
    });

    return allExpenses
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Process profit trend data
  const processProfitTrendData = () => {
    return data.headings.map((month, index) => ({
      month,
      grossProfit: parseFloat((data.grossProfitDataRow[index] || '0').replace(/[,$-]/g, '')) || 0,
      netProfit: parseFloat((data.netProfitDataRow[index] || '0').replace(/[,$-]/g, '')) || 0
    }));
  };

  // Filter data for comparison if months are selected
  const getComparisonData = (chartData: any[]) => {
    if (!selectedMonth && comparisonMonths.length === 0) return chartData;
    
    const monthsToShow = [selectedMonth, ...comparisonMonths].filter(Boolean);
    return chartData.filter(item => monthsToShow.includes(item.month));
  };

  const revenueData = processRevenueData();
  const expensesData = processTopExpensesData();
  const profitTrendData = processProfitTrendData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue across the financial year</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getComparisonData(revenueData)}>
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
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profit Trend</CardTitle>
            <CardDescription>Gross vs Net profit comparison</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getComparisonData(profitTrendData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="grossProfit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Gross Profit"
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Net Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Expenses Chart */}
      {expensesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Expenses</CardTitle>
            <CardDescription>Largest expense categories for the financial year</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Month Comparison Chart - only show if months are selected */}
      {(selectedMonth || comparisonMonths.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Month Comparison</CardTitle>
            <CardDescription>Selected month vs comparison months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getComparisonData(revenueData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialYearCharts;
