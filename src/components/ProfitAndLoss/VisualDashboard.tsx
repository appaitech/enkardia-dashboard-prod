import React, { useMemo } from 'react';
import { VisualDashboardData, ProfitAndLossRow } from '@/services/financialService';
import { Card } from '@/components/ui/card';
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
  TooltipProps
} from 'recharts';
import { formatCurrency } from "@/lib/utils";

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
    }));

  // Process expense data
  const expenseRows = findRowsByType(report.Rows, 'Less Operating Expenses');
  const expenseData = expenseRows
    .filter(row => row.RowType === 'Row')
    .map(row => ({
      name: row.Cells?.[0]?.Value || '',
      value: parseFloat((row.Cells?.[1]?.Value || '0').replace(/,/g, ''))
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  // Get summary values
  const totalIncome = incomeRows.find(row => row.RowType === 'SummaryRow')?.Cells?.[1]?.Value || '0';
  const totalExpenses = expenseRows.find(row => row.RowType === 'SummaryRow')?.Cells?.[1]?.Value || '0';
  const netProfit = report.Rows
    .find(section => section.Rows?.some(row => row.Cells?.[0]?.Value === 'Net Profit'))
    ?.Rows?.find(row => row.Cells?.[0]?.Value === 'Net Profit')
    ?.Cells?.[1]?.Value || '0';

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'];

  // First, let's define a nice color palette near the top of the component
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

  // Custom label formatter for the pie charts
  const renderCustomizedLabel = (props: any) => {
    const { name, percent } = props;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  // Custom tooltip formatter that handles number values
  const customTooltipFormatter = (value: number | string) => {
    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <h3 className="text-sm font-medium text-slate-500">Total Income</h3>
          <p className="text-2xl font-bold">{formatCurrency(parseFloat(totalIncome))}</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <h3 className="text-sm font-medium text-slate-500">Total Expenses</h3>
          <p className="text-2xl font-bold">{formatCurrency(parseFloat(totalExpenses))}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <h3 className="text-sm font-medium text-slate-500">Net Profit</h3>
          <p className="text-2xl font-bold">{formatCurrency(parseFloat(netProfit))}</p>
        </Card>
      </div>

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
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value) => {
                return typeof value === 'number' ? formatCurrency(value) : value;
              }} />
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
                  return `${name}: ${(typeof percent === 'number' ? (percent * 100).toFixed(0) : '0')}%`;
                }}
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => {
                return typeof value === 'number' ? formatCurrency(value) : value;
              }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => {
                return typeof value === 'number' ? formatCurrency(value) : value;
              }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default VisualDashboard;
