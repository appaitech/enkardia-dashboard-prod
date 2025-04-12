
import React from 'react';
import { ProfitAndLossResponse } from '@/services/financialService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnnualComparisonViewProps {
  data: ProfitAndLossResponse;
}

const AnnualComparisonView: React.FC<AnnualComparisonViewProps> = ({ data }) => {
  if (!data || !data.Reports || !data.Reports.length) {
    return <div>No annual comparison data available</div>;
  }

  const report = data.Reports[0];
  
  // Extract years from column headers (this is specifically for annual comparison data)
  const years = report.Rows[0]?.Cells?.slice(1).map(cell => cell.Value) || [];
  
  // Extract revenue, expenses, and net profit data for each year
  const annualData = {
    revenue: [] as number[],
    expenses: [] as number[],
    netProfit: [] as number[]
  };
  
  // Process rows to extract yearly data
  for (const section of report.Rows) {
    if (section.Title === 'Income' && section.Rows) {
      const summaryRow = section.Rows.find(row => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells) {
        // Skip first cell (it's the label) and extract values for each year
        annualData.revenue = summaryRow.Cells.slice(1).map(cell => 
          parseFloat(cell.Value.replace(/,/g, ''))
        );
      }
    }
    else if (section.Title === 'Less Operating Expenses' && section.Rows) {
      const summaryRow = section.Rows.find(row => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells) {
        annualData.expenses = summaryRow.Cells.slice(1).map(cell => 
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
      annualData.netProfit = netProfitRow.Cells.slice(1).map(cell => 
        parseFloat(cell.Value.replace(/,/g, ''))
      );
    }
  }
  
  // Prepare chart data
  const chartData = years.map((year, index) => ({
    name: year,
    Revenue: annualData.revenue[index] || 0,
    Expenses: annualData.expenses[index] || 0,
    'Net Profit': annualData.netProfit[index] || 0
  }));
  
  // Calculate growth rates if we have multiple years
  const growthRates = {
    revenue: 0,
    expenses: 0,
    netProfit: 0
  };
  
  if (annualData.revenue.length >= 2) {
    const latestIndex = annualData.revenue.length - 1;
    const previousIndex = latestIndex - 1;
    
    growthRates.revenue = ((annualData.revenue[latestIndex] - annualData.revenue[previousIndex]) / annualData.revenue[previousIndex]) * 100;
    growthRates.expenses = ((annualData.expenses[latestIndex] - annualData.expenses[previousIndex]) / annualData.expenses[previousIndex]) * 100;
    growthRates.netProfit = annualData.netProfit[previousIndex] !== 0 ? 
      ((annualData.netProfit[latestIndex] - annualData.netProfit[previousIndex]) / Math.abs(annualData.netProfit[previousIndex])) * 100 : 0;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-4 ${growthRates.revenue >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-sm font-medium text-slate-500">Revenue Growth</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{growthRates.revenue.toFixed(1)}%</p>
            {growthRates.revenue >= 0 ? 
              <TrendingUp className="ml-2 h-5 w-5 text-green-600" /> : 
              <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
            }
          </div>
          <p className="text-xs text-slate-500 mt-1">Year over Year</p>
        </Card>
        
        <Card className={`p-4 ${growthRates.expenses <= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-sm font-medium text-slate-500">Expense Growth</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{growthRates.expenses.toFixed(1)}%</p>
            {growthRates.expenses <= 0 ? 
              <TrendingDown className="ml-2 h-5 w-5 text-green-600" /> : 
              <TrendingUp className="ml-2 h-5 w-5 text-red-600" />
            }
          </div>
          <p className="text-xs text-slate-500 mt-1">Year over Year</p>
        </Card>
        
        <Card className={`p-4 ${growthRates.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-sm font-medium text-slate-500">Profit Growth</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{growthRates.netProfit.toFixed(1)}%</p>
            {growthRates.netProfit >= 0 ? 
              <TrendingUp className="ml-2 h-5 w-5 text-green-600" /> : 
              <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
            }
          </div>
          <p className="text-xs text-slate-500 mt-1">Year over Year</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Annual Financial Performance</CardTitle>
          <CardDescription>Year-over-year comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
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
          <CardTitle>Annual Details</CardTitle>
          <CardDescription>Key metrics by year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b pb-2 text-left font-medium">Year</th>
                  <th className="border-b pb-2 text-right font-medium">Revenue</th>
                  <th className="border-b pb-2 text-right font-medium">Expenses</th>
                  <th className="border-b pb-2 text-right font-medium">Net Profit</th>
                  <th className="border-b pb-2 text-right font-medium">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {years.map((year, index) => {
                  const revenue = annualData.revenue[index] || 0;
                  const expenses = annualData.expenses[index] || 0; 
                  const netProfit = annualData.netProfit[index] || 0;
                  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
                  
                  return (
                    <tr key={year} className="border-b border-muted">
                      <td className="py-3 text-left">{year}</td>
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

export default AnnualComparisonView;
