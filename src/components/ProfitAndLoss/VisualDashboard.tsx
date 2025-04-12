
import React, { useMemo } from 'react';
import { VisualDashboardData, ProfitAndLossRow } from '@/services/financialService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface VisualDashboardProps {
  data: VisualDashboardData;
}

const VisualDashboard: React.FC<VisualDashboardProps> = ({ data }) => {
  if (!data || !data.Reports || !data.Reports.length) {
    return <div>No visual dashboard data available</div>;
  }

  // Get the report
  const report = data.Reports[0];
  
  // Extract financial data
  const findRowsByType = (rows: ProfitAndLossRow[], title: string): ProfitAndLossRow[] => {
    for (const row of rows) {
      if (row.Title === title) {
        return row.Rows || [];
      }
    }
    return [];
  };

  // Process income data
  const incomeRows = findRowsByType(report.Rows, 'Income');
  const incomeData = incomeRows
    .filter(row => row.RowType === 'Row')
    .map(row => ({
      name: row.Cells?.[0]?.Value || '',
      value: parseFloat((row.Cells?.[1]?.Value || '0').replace(/,/g, ''))
    }))
    .filter(item => item.value !== 0); // Filter out zero values

  // Process expense data
  const expenseRows = findRowsByType(report.Rows, 'Less Operating Expenses');
  const expenseData = expenseRows
    .filter(row => row.RowType === 'Row')
    .map(row => ({
      name: row.Cells?.[0]?.Value || '',
      value: parseFloat((row.Cells?.[1]?.Value || '0').replace(/,/g, ''))
    }))
    .filter(item => item.value !== 0) // Filter out zero values
    .sort((a, b) => b.value - a.value); // Sort by value descending

  // Get summary values
  const totalIncome = incomeRows.find(row => row.RowType === 'SummaryRow')?.Cells?.[1]?.Value || '0';
  const totalExpenses = expenseRows.find(row => row.RowType === 'SummaryRow')?.Cells?.[1]?.Value || '0';
  const netProfit = report.Rows
    .find(section => section.Rows?.some(row => row.Cells?.[0]?.Value === 'Net Profit'))
    ?.Rows?.find(row => row.Cells?.[0]?.Value === 'Net Profit')
    ?.Cells?.[1]?.Value || '0';

  // Calculate metrics
  const totalIncomeValue = parseFloat(totalIncome.replace(/,/g, ''));
  const totalExpensesValue = parseFloat(totalExpenses.replace(/,/g, ''));
  const netProfitValue = parseFloat(netProfit.replace(/,/g, ''));
  
  const profitMargin = totalIncomeValue > 0 ? (netProfitValue / totalIncomeValue) * 100 : 0;
  const expenseRatio = totalIncomeValue > 0 ? (totalExpensesValue / totalIncomeValue) * 100 : 0;

  // Create a dataset for revenue vs expenses breakdown
  const revenueVsExpensesData = [
    {
      name: 'Revenue',
      value: totalIncomeValue
    },
    {
      name: 'Expenses',
      value: totalExpensesValue
    },
    {
      name: 'Net Profit',
      value: netProfitValue
    }
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'];

  // Define a nice color palette for expenses
  const EXPENSE_COLORS = [
    '#3b82f6', // blue
    '#14b8a6', // teal
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#0ea5e9', // sky
    '#10b981', // emerald
    '#6d28d9', // violet
    '#0284c7', // lightBlue
    '#059669'  // green
  ];

  // Extract the report date range
  const reportPeriod = report.ReportDate || 'Current Period';

  // Calculate financial health indicators
  const profitMarginHealth = profitMargin >= 15 ? 'excellent' : profitMargin >= 10 ? 'good' : profitMargin >= 5 ? 'fair' : 'poor';
  const expenseRatioHealth = expenseRatio <= 70 ? 'excellent' : expenseRatio <= 80 ? 'good' : expenseRatio <= 90 ? 'fair' : 'poor';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Financial Dashboard</CardTitle>
          <CardDescription>{reportPeriod}</CardDescription>
        </CardHeader>
      </Card>
    
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50">
          <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{formatCurrency(totalIncomeValue)}</p>
            <TrendingUp className="ml-2 h-5 w-5 text-blue-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">{reportPeriod}</p>
        </Card>

        <Card className="p-4 bg-red-50">
          <h3 className="text-sm font-medium text-slate-500">Total Expenses</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{formatCurrency(totalExpensesValue)}</p>
            <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">{expenseRatio.toFixed(1)}% of revenue</p>
        </Card>

        <Card className={`p-4 ${netProfitValue >= 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
          <h3 className="text-sm font-medium text-slate-500">Net Profit</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{formatCurrency(netProfitValue)}</p>
            {netProfitValue >= 0 ? (
              <ArrowUpRight className="ml-2 h-5 w-5 text-green-600" />
            ) : (
              <ArrowDownRight className="ml-2 h-5 w-5 text-amber-600" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{reportPeriod}</p>
        </Card>

        <Card className={`p-4 ${
          profitMarginHealth === 'excellent' ? 'bg-green-50' : 
          profitMarginHealth === 'good' ? 'bg-emerald-50' : 
          profitMarginHealth === 'fair' ? 'bg-amber-50' : 
          'bg-red-50'
        }`}>
          <h3 className="text-sm font-medium text-slate-500">Profit Margin</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{profitMargin.toFixed(1)}%</p>
            {profitMargin >= 10 ? (
              <TrendingUp className="ml-2 h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="ml-2 h-5 w-5 text-amber-600" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {profitMarginHealth === 'excellent' ? 'Excellent' : 
             profitMarginHealth === 'good' ? 'Good' : 
             profitMarginHealth === 'fair' ? 'Fair' : 
             'Needs improvement'}
          </p>
        </Card>
      </div>

      {/* Revenue & Expenses Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Expenses Overview</CardTitle>
          <CardDescription>{reportPeriod}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueVsExpensesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Amount"
                  radius={[4, 4, 0, 0]}
                >
                  {revenueVsExpensesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#3b82f6' : index === 1 ? '#ef4444' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Expenses Bar Chart */}
      <Card className="p-4 col-span-1 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Top Expenses</h3>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={expenseData.slice(0, 5)} // Show top 5 expenses
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value, true)} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="value" name="Amount">
                {expenseData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Income and Expense Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {incomeData.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Income Breakdown</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => {
                      return percent && percent > 0.05 ? `${name}: ${(typeof percent === 'number' ? (percent * 100).toFixed(0) : '0')}%` : '';
                    }}
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {expenseData.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => {
                      return percent && percent > 0.05 ? `${name}: ${(typeof percent === 'number' ? (percent * 100).toFixed(0) : '0')}%` : '';
                    }}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Financial Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
          <CardDescription>{reportPeriod}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Revenue Analysis</h3>
              <p className="text-slate-700">
                {incomeData.length > 0 ? 
                  `Your top revenue source is ${incomeData[0].name}, representing ${((incomeData[0].value / totalIncomeValue) * 100).toFixed(1)}% of total revenue.` :
                  "No revenue data available for analysis."
                }
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium mb-2">Expense Analysis</h3>
              <p className="text-slate-700">
                {expenseData.length > 0 ? 
                  `Your top expense is ${expenseData[0].name}, representing ${((expenseData[0].value / totalExpensesValue) * 100).toFixed(1)}% of total expenses.` :
                  "No expense data available for analysis."
                }
              </p>
            </div>

            <div className={`p-4 rounded-lg ${profitMargin >= 10 ? 'bg-green-50' : 'bg-amber-50'}`}>
              <h3 className="font-medium mb-2">Profitability</h3>
              <p className="text-slate-700">
                {profitMargin >= 15 ? 
                  `Your profit margin of ${profitMargin.toFixed(1)}% is excellent. This indicates strong financial health.` :
                  profitMargin >= 10 ?
                  `Your profit margin of ${profitMargin.toFixed(1)}% is good. Continue monitoring expenses to maintain profitability.` :
                  profitMargin >= 5 ?
                  `Your profit margin of ${profitMargin.toFixed(1)}% is fair. Consider strategies to increase revenue or reduce expenses.` :
                  `Your profit margin of ${profitMargin.toFixed(1)}% needs improvement. Review expenses and pricing strategy.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualDashboard;
