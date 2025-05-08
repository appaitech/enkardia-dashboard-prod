
import React from 'react';
import { ProfitAndLossResponse } from '@/services/financialService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface QuarterlyBreakdownViewProps {
  data: ProfitAndLossResponse;
  startDate?: string;  // Adding the missing prop
  endDate?: string;    // Adding the missing prop
}

const QuarterlyBreakdownView: React.FC<QuarterlyBreakdownViewProps> = ({ data, startDate, endDate }) => {
  if (!data || !data.Reports || !data.Reports.length) {
    return <div>No quarterly breakdown data available</div>;
  }

  const report = data.Reports[0];
  
  // Extract quarters from column headers
  const quarters = report.Rows[0]?.Cells?.slice(1).map(cell => cell.Value) || [];
  
  // Extract revenue, expenses, and net profit data for each quarter
  const quarterlyData = {
    revenue: [] as number[],
    expenses: [] as number[],
    netProfit: [] as number[],
    topExpenses: [] as { name: string, values: number[] }[]
  };
  
  // Process rows to extract quarterly data
  for (const section of report.Rows) {
    if (section.Title === 'Income' && section.Rows) {
      const summaryRow = section.Rows.find(row => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells) {
        // Skip first cell (it's the label) and extract values for each quarter
        quarterlyData.revenue = summaryRow.Cells.slice(1).map(cell => 
          parseFloat(cell.Value.replace(/,/g, ''))
        );
      }
    }
    else if (section.Title === 'Less Operating Expenses' && section.Rows) {
      // Extract top expense categories
      const expenseRows = section.Rows.filter(row => row.RowType === 'Row');
      expenseRows.slice(0, 5).forEach(row => {
        if (row.Cells) {
          const name = row.Cells[0].Value;
          const values = row.Cells.slice(1).map(cell => 
            parseFloat(cell.Value.replace(/,/g, ''))
          );
          quarterlyData.topExpenses.push({ name, values });
        }
      });
      
      // Get total expenses
      const summaryRow = section.Rows.find(row => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells) {
        quarterlyData.expenses = summaryRow.Cells.slice(1).map(cell => 
          parseFloat(cell.Value.replace(/,/g, ''))
        );
      }
    }
  }
  
  // Find Net Profit row
  const netProfitSection = report.Rows.find(section => 
    section.Rows?.some(row => row.Cells?.[0]?.Value === 'Net Profit')
  );
  
  if (netProfitSection && netProfitSection.Rows) {
    const netProfitRow = netProfitSection.Rows.find(row => row.Cells?.[0]?.Value === 'Net Profit');
    if (netProfitRow && netProfitRow.Cells) {
      quarterlyData.netProfit = netProfitRow.Cells.slice(1).map(cell => 
        parseFloat(cell.Value.replace(/,/g, ''))
      );
    }
  }
  
  // Prepare chart data for main metrics
  const mainChartData = quarters.map((quarter, index) => ({
    name: quarter,
    Revenue: quarterlyData.revenue[index] || 0,
    Expenses: quarterlyData.expenses[index] || 0,
    'Net Profit': quarterlyData.netProfit[index] || 0
  }));
  
  // Prepare chart data for top expenses
  const expenseChartData = quarters.map((quarter, index) => {
    const quarterData: Record<string, any> = { name: quarter };
    quarterlyData.topExpenses.forEach(expense => {
      quarterData[expense.name] = expense.values[index] || 0;
    });
    return quarterData;
  });
  
  // Generate color scheme for the expense categories
  const EXPENSE_COLORS = [
    '#3b82f6', // blue
    '#14b8a6', // teal
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#6366f1', // indigo
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Financial Performance</CardTitle>
          <CardDescription>Revenue, expenses and profit by quarter</CardDescription>
          {startDate && endDate && (
            <div className="text-sm text-muted-foreground mt-1">
              Period: {startDate} to {endDate}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mainChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Bar dataKey="Revenue" fill="#3b82f6" />
                <Bar dataKey="Expenses" fill="#ef4444" />
                <Bar dataKey="Net Profit" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Expense Categories</CardTitle>
          <CardDescription>Quarterly expense trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={expenseChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                {quarterlyData.topExpenses.map((expense, index) => (
                  <Line 
                    key={expense.name}
                    type="monotone" 
                    dataKey={expense.name} 
                    stroke={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly Details</CardTitle>
          <CardDescription>Key metrics by quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b pb-2 text-left font-medium">Quarter</th>
                  <th className="border-b pb-2 text-right font-medium">Revenue</th>
                  <th className="border-b pb-2 text-right font-medium">Expenses</th>
                  <th className="border-b pb-2 text-right font-medium">Net Profit</th>
                  <th className="border-b pb-2 text-right font-medium">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {quarters.map((quarter, index) => {
                  const revenue = quarterlyData.revenue[index] || 0;
                  const expenses = quarterlyData.expenses[index] || 0; 
                  const netProfit = quarterlyData.netProfit[index] || 0;
                  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
                  
                  return (
                    <tr key={quarter} className="border-b border-muted">
                      <td className="py-3 text-left">{quarter}</td>
                      <td className="py-3 text-right">{formatCurrency(revenue)}</td>
                      <td className="py-3 text-right">{formatCurrency(expenses)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(netProfit)}</td>
                      <td className="py-3 text-right">{margin.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuarterlyBreakdownView;
