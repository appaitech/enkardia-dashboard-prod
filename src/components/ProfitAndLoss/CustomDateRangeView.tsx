import React from 'react';
import { ProfitAndLossResponse } from '@/services/financialService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';

interface CustomDateRangeViewProps {
  data: ProfitAndLossResponse;
  fromDate: string;
  toDate: string;
}

const CustomDateRangeView: React.FC<CustomDateRangeViewProps> = ({ data, fromDate, toDate }) => {
  if (!data || !data.Reports || !data.Reports.length) {
    return <div>No data available for the selected date range</div>;
  }

  const report = data.Reports[0];
  
  // Extract financial data
  const findRowsByType = (rows: any[], title: string): any[] => {
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
    .filter(item => item.value !== 0)
    .sort((a, b) => b.value - a.value);

  // Process expense data
  const expenseRows = findRowsByType(report.Rows, 'Less Operating Expenses');
  const expenseData = expenseRows
    .filter(row => row.RowType === 'Row')
    .map(row => ({
      name: row.Cells?.[0]?.Value || '',
      value: parseFloat((row.Cells?.[1]?.Value || '0').replace(/,/g, ''))
    }))
    .filter(item => item.value !== 0)
    .sort((a, b) => b.value - a.value);

  // Get summary values
  const totalIncome = incomeRows.find(row => row.RowType === 'SummaryRow')?.Cells?.[1]?.Value || '0';
  const totalExpenses = expenseRows.find(row => row.RowType === 'SummaryRow')?.Cells?.[1]?.Value || '0';
  const netProfit = report.Rows
    .find(section => section.Rows?.some(row => row.Cells?.[0]?.Value === 'Net Profit'))
    ?.Rows?.find(row => row.Cells?.[0]?.Value === 'Net Profit')
    ?.Cells?.[1]?.Value || '0';

  // Calculate meaningful metrics
  const totalIncomeValue = parseFloat(totalIncome.replace(/,/g, ''));
  const totalExpensesValue = parseFloat(totalExpenses.replace(/,/g, ''));
  const netProfitValue = parseFloat(netProfit.replace(/,/g, '));
  
  const profitMargin = totalIncomeValue > 0 ? (netProfitValue / totalIncomeValue) * 100 : 0;
  const expenseRatio = totalIncomeValue > 0 ? (totalExpensesValue / totalIncomeValue) * 100 : 0;
  
  // Generate color palette for charts
  const COLORS = ['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#6366f1', '#f43f5e', '#10b981', '#ef4444'];

  // Format date range for display
  const formatDateString = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const dateRangeString = `${formatDateString(fromDate)} to ${formatDateString(toDate)}`;

  return (
    <div className="space-y-8">
      <Card className="bg-white border-navy-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold text-navy-900">Custom Date Range Analysis</CardTitle>
          <CardDescription className="text-navy-600 font-medium">{dateRangeString}</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-100">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Total Revenue</h3>
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalIncomeValue)}</p>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-50/50 border-red-100">
          <h3 className="text-sm font-medium text-red-700 mb-2">Total Expenses</h3>
          <div className="flex items-center">
            <BarChart2 className="h-6 w-6 text-red-600 mr-3" />
            <p className="text-2xl font-bold text-red-900">{formatCurrency(totalExpensesValue)}</p>
          </div>
        </Card>
        
        <Card className={`p-6 ${netProfitValue >= 0 ? 
          'bg-gradient-to-br from-green-50 to-green-50/50 border-green-100' : 
          'bg-gradient-to-br from-amber-50 to-amber-50/50 border-amber-100'}`}>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Net Profit</h3>
          <div className="flex items-center">
            {netProfitValue >= 0 ? (
              <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
            ) : (
              <TrendingDown className="h-6 w-6 text-amber-600 mr-3" />
            )}
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(netProfitValue)}</p>
          </div>
        </Card>
        
        <Card className={`p-6 ${profitMargin >= 15 ? 
          'bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-100' : 
          profitMargin >= 0 ? 
          'bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-100' : 
          'bg-gradient-to-br from-red-50 to-red-50/50 border-red-100'}`}>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Profit Margin</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900">{profitMargin.toFixed(1)}%</p>
            {profitMargin >= 15 ? (
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            ) : profitMargin >= 0 ? (
              <TrendingUp className="h-6 w-6 text-blue-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-navy-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-navy-800">Revenue Breakdown</CardTitle>
            <CardDescription className="text-navy-600">{dateRangeString}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeData.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {incomeData.length > 8 && (
              <p className="text-xs text-center text-slate-500 mt-2">
                Showing top 8 revenue sources of {incomeData.length} total
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-navy-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-navy-800">Expense Breakdown</CardTitle>
            <CardDescription className="text-navy-600">{dateRangeString}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="35%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={130}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      if (percent < 0.05) return null;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    wrapperStyle={{
                      paddingLeft: '24px',
                      right: '0px',
                      width: '45%',
                      height: '100%',
                      overflowY: 'auto',
                      position: 'absolute' as 'absolute',
                    }}
                    content={({ payload }) => (
                      <div className="bg-white rounded-lg p-4 h-full">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">
                          Expense Categories
                        </h4>
                        <div className="space-y-3">
                          {payload?.map((entry: any, index: number) => {
                            const item = expenseData.find(d => d.name === entry.value);
                            const percentage = (item?.value || 0) / expenseData.reduce((sum, i) => sum + i.value, 0) * 100;
                            return (
                              <div key={`item-${index}`} className="flex items-center gap-2">
                                <span 
                                  className="w-3 h-3 rounded-full shrink-0" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="flex-1 text-sm text-slate-700 truncate">
                                  {entry.value}
                                </span>
                                <div className="text-right shrink-0">
                                  <div className="font-mono text-sm text-slate-900 tabular-nums">
                                    {formatCurrency(item?.value || 0)}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-navy-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-navy-800">Top Expenses</CardTitle>
          <CardDescription className="text-navy-600">{dateRangeString}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseData.slice(0, 10)}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fill: '#475569', fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={{ fill: '#475569', fontSize: 12 }}
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
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 4, 4]}
                >
                  {expenseData.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[(index + 2) % COLORS.length]}
                      style={{ filter: 'brightness(1.1)' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-navy-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-navy-800">Financial Summary</CardTitle>
          <CardDescription className="text-navy-600">{dateRangeString}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 pb-3 text-left font-semibold text-slate-700">Category</th>
                  <th className="border-b border-slate-200 pb-3 text-right font-semibold text-slate-700">Amount</th>
                  <th className="border-b border-slate-200 pb-3 text-right font-semibold text-slate-700">% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-4 text-left font-medium text-slate-900">Total Revenue</td>
                  <td className="py-4 text-right font-mono text-slate-900">{formatCurrency(totalIncomeValue)}</td>
                  <td className="py-4 text-right text-slate-900">100.0%</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-4 text-left font-medium text-slate-900">Total Expenses</td>
                  <td className="py-4 text-right font-mono text-slate-900">{formatCurrency(totalExpensesValue)}</td>
                  <td className="py-4 text-right text-slate-900">{expenseRatio.toFixed(1)}%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-4 text-left font-medium text-slate-900">Net Profit</td>
                  <td className="py-4 text-right font-mono text-slate-900">{formatCurrency(netProfitValue)}</td>
                  <td className="py-4 text-right text-slate-900">{profitMargin.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDateRangeView;
