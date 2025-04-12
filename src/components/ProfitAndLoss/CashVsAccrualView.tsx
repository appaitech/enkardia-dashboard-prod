
import React from 'react';
import { ProfitAndLossResponse } from '@/services/financialService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';

interface CashVsAccrualViewProps {
  cashData: ProfitAndLossResponse;
  accrualData: ProfitAndLossResponse;
  date: string;
}

const CashVsAccrualView: React.FC<CashVsAccrualViewProps> = ({ cashData, accrualData, date }) => {
  if (!cashData || !cashData.Reports || !cashData.Reports.length || 
      !accrualData || !accrualData.Reports || !accrualData.Reports.length) {
    return <div>No cash vs accrual data available</div>;
  }

  const cashReport = cashData.Reports[0];
  const accrualReport = accrualData.Reports[0];
  
  // Extract financial summary data
  const extractFinancialData = (report: any) => {
    let revenue = 0;
    let expenses = 0;
    let netProfit = 0;
    
    // Extract revenue
    const incomeSection = report.Rows.find((row: any) => row.Title === 'Income');
    if (incomeSection && incomeSection.Rows) {
      const summaryRow = incomeSection.Rows.find((row: any) => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells && summaryRow.Cells[1]) {
        revenue = parseFloat(summaryRow.Cells[1].Value.replace(/,/g, ''));
      }
    }
    
    // Extract expenses
    const expensesSection = report.Rows.find((row: any) => row.Title === 'Less Operating Expenses');
    if (expensesSection && expensesSection.Rows) {
      const summaryRow = expensesSection.Rows.find((row: any) => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells && summaryRow.Cells[1]) {
        expenses = parseFloat(summaryRow.Cells[1].Value.replace(/,/g, ''));
      }
    }
    
    // Extract net profit
    const netProfitSection = report.Rows.find((section: any) => 
      section.Rows?.some((row: any) => row.Cells?.[0]?.Value === 'Net Profit')
    );
    
    if (netProfitSection && netProfitSection.Rows) {
      const netProfitRow = netProfitSection.Rows.find((row: any) => row.Cells?.[0]?.Value === 'Net Profit');
      if (netProfitRow && netProfitRow.Cells && netProfitRow.Cells[1]) {
        netProfit = parseFloat(netProfitRow.Cells[1].Value.replace(/,/g, ''));
      }
    }
    
    return { revenue, expenses, netProfit };
  };
  
  const cashFinancials = extractFinancialData(cashReport);
  const accrualFinancials = extractFinancialData(accrualReport);
  
  // Calculate differences and percentages
  const differences = {
    revenue: accrualFinancials.revenue - cashFinancials.revenue,
    expenses: accrualFinancials.expenses - cashFinancials.expenses,
    netProfit: accrualFinancials.netProfit - cashFinancials.netProfit
  };
  
  const percentages = {
    revenue: cashFinancials.revenue !== 0 ? 
      (differences.revenue / cashFinancials.revenue) * 100 : 0,
    expenses: cashFinancials.expenses !== 0 ? 
      (differences.expenses / cashFinancials.expenses) * 100 : 0,
    netProfit: cashFinancials.netProfit !== 0 ? 
      (differences.netProfit / Math.abs(cashFinancials.netProfit)) * 100 : 0
  };
  
  // Prepare chart data for comparison
  const comparisonChartData = [
    {
      name: 'Revenue',
      Cash: cashFinancials.revenue,
      Accrual: accrualFinancials.revenue,
      Difference: differences.revenue
    },
    {
      name: 'Expenses',
      Cash: cashFinancials.expenses,
      Accrual: accrualFinancials.expenses,
      Difference: differences.expenses
    },
    {
      name: 'Net Profit',
      Cash: cashFinancials.netProfit,
      Accrual: accrualFinancials.netProfit,
      Difference: differences.netProfit
    }
  ];
  
  // Extract top differences in revenue items
  const extractItemDifferences = (cashReport: any, accrualReport: any, sectionTitle: string) => {
    const cashSection = cashReport.Rows.find((row: any) => row.Title === sectionTitle);
    const accrualSection = accrualReport.Rows.find((row: any) => row.Title === sectionTitle);
    
    if (!cashSection?.Rows || !accrualSection?.Rows) return [];
    
    const cashItems = cashSection.Rows
      .filter((row: any) => row.RowType === 'Row')
      .reduce((acc: any, row: any) => {
        if (row.Cells) {
          const name = row.Cells[0].Value;
          const value = parseFloat(row.Cells[1].Value.replace(/,/g, ''));
          acc[name] = value;
        }
        return acc;
      }, {});
    
    const accrualItems = accrualSection.Rows
      .filter((row: any) => row.RowType === 'Row')
      .reduce((acc: any, row: any) => {
        if (row.Cells) {
          const name = row.Cells[0].Value;
          const value = parseFloat(row.Cells[1].Value.replace(/,/g, ''));
          acc[name] = value;
        }
        return acc;
      }, {});
    
    // Combine all keys
    const allKeys = [...new Set([...Object.keys(cashItems), ...Object.keys(accrualItems)])];
    
    // Calculate differences
    const itemDifferences = allKeys.map(key => {
      const cashValue = cashItems[key] || 0;
      const accrualValue = accrualItems[key] || 0;
      const difference = accrualValue - cashValue;
      const percentDiff = cashValue !== 0 ? (difference / Math.abs(cashValue)) * 100 : 0;
      
      return {
        name: key,
        Cash: cashValue,
        Accrual: accrualValue,
        Difference: difference,
        PercentDifference: percentDiff
      };
    }).filter(item => item.Difference !== 0)
    .sort((a, b) => Math.abs(b.Difference) - Math.abs(a.Difference));
    
    return itemDifferences;
  };
  
  const revenueDifferences = extractItemDifferences(cashReport, accrualReport, 'Income');
  const expenseDifferences = extractItemDifferences(cashReport, accrualReport, 'Less Operating Expenses');
  
  // Format date for display
  const formatDateString = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Cash vs. Accrual Comparison</CardTitle>
          <CardDescription>Analysis as of {formatDateString(date)}</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <h3 className="text-sm font-medium text-slate-500">Revenue Difference</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{formatCurrency(differences.revenue)}</p>
            {differences.revenue >= 0 ? (
              <TrendingUp className="ml-2 h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accrual is {Math.abs(percentages.revenue).toFixed(1)}% {differences.revenue >= 0 ? 'higher' : 'lower'} than cash basis
          </p>
        </Card>
        
        <Card className="p-4 bg-red-50">
          <h3 className="text-sm font-medium text-slate-500">Expense Difference</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{formatCurrency(differences.expenses)}</p>
            {differences.expenses >= 0 ? (
              <TrendingUp className="ml-2 h-5 w-5 text-red-600" />
            ) : (
              <TrendingDown className="ml-2 h-5 w-5 text-green-600" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accrual is {Math.abs(percentages.expenses).toFixed(1)}% {differences.expenses >= 0 ? 'higher' : 'lower'} than cash basis
          </p>
        </Card>
        
        <Card className="p-4 bg-green-50">
          <h3 className="text-sm font-medium text-slate-500">Net Profit Difference</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold">{formatCurrency(differences.netProfit)}</p>
            {differences.netProfit >= 0 ? (
              <TrendingUp className="ml-2 h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="ml-2 h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accrual is {Math.abs(percentages.netProfit).toFixed(1)}% {differences.netProfit >= 0 ? 'higher' : 'lower'} than cash basis
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash vs. Accrual Comparison</CardTitle>
          <CardDescription>Key financial metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, true)}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Bar dataKey="Cash" name="Cash Basis" fill="#3b82f6" />
                <Bar dataKey="Accrual" name="Accrual Basis" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Revenue Differences</CardTitle>
          <CardDescription>Items with largest cash vs. accrual variance</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueDifferences.length === 0 ? (
            <p className="text-center py-4 text-slate-500">No significant revenue differences found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b pb-2 text-left font-medium">Revenue Item</th>
                    <th className="border-b pb-2 text-right font-medium">Cash Basis</th>
                    <th className="border-b pb-2 text-right font-medium">Accrual Basis</th>
                    <th className="border-b pb-2 text-right font-medium">Difference</th>
                    <th className="border-b pb-2 text-right font-medium">% Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueDifferences.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b border-muted">
                      <td className="py-3 text-left">{item.name}</td>
                      <td className="py-3 text-right">{formatCurrency(item.Cash)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.Accrual)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.Difference)}</td>
                      <td className={`py-3 text-right ${item.Difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.Difference >= 0 ? '+' : ''}{item.PercentDifference.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Expense Differences</CardTitle>
          <CardDescription>Items with largest cash vs. accrual variance</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseDifferences.length === 0 ? (
            <p className="text-center py-4 text-slate-500">No significant expense differences found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b pb-2 text-left font-medium">Expense Item</th>
                    <th className="border-b pb-2 text-right font-medium">Cash Basis</th>
                    <th className="border-b pb-2 text-right font-medium">Accrual Basis</th>
                    <th className="border-b pb-2 text-right font-medium">Difference</th>
                    <th className="border-b pb-2 text-right font-medium">% Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseDifferences.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b border-muted">
                      <td className="py-3 text-left">{item.name}</td>
                      <td className="py-3 text-right">{formatCurrency(item.Cash)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.Accrual)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.Difference)}</td>
                      <td className={`py-3 text-right ${item.Difference <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.Difference >= 0 ? '+' : ''}{item.PercentDifference.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash vs. Accrual: Summary & Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Cash Basis Accounting</h3>
              <p className="text-slate-600">
                Records revenue when cash is received and expenses when cash is paid out, regardless of when the corresponding
                products or services were delivered or used.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">Accrual Basis Accounting</h3>
              <p className="text-slate-600">
                Records revenue when earned and expenses when incurred, regardless of when cash changes hands. This gives a more
                accurate picture of a company's financial position over time.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">Key Differences</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li><strong>Timing:</strong> Cash basis focuses on when money moves, accrual focuses on when value is created/used.</li>
                <li><strong>Accounts Receivable/Payable:</strong> Only accrual basis includes these, representing money owed to/by the business.</li>
                <li><strong>Financial Picture:</strong> Accrual provides a more accurate long-term view of business performance.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashVsAccrualView;
