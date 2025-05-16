
import React from "react";
import {
  Chart,
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

interface FinancialYearChartsProps {
  data: any;
}

const FinancialYearCharts: React.FC<FinancialYearChartsProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  if (!data || !data.headings || data.headings.length === 0) {
    return null;
  }

  // Transform the data for the charts
  const prepareMonthlyTrendData = () => {
    // Create data for revenue, expenses, and profit trends
    const trendData = [];

    // Convert headings (months) to data points
    for (let i = 0; i < data.headings.length; i++) {
      const monthData: any = {
        name: data.headings[i],
      };

      // Get gross revenue from the first gross profit section
      if (data.grossProfitSections && data.grossProfitSections.length > 0) {
        const revenueSection = data.grossProfitSections[0];
        if (revenueSection.dataRowObjects && revenueSection.dataRowObjects.length > 0) {
          // Sum up all revenue rows
          let totalRevenue = 0;
          for (const row of revenueSection.dataRowObjects) {
            if (row.rowType !== "SummaryRow" && row.rowData && row.rowData.length > i) {
              const value = typeof row.rowData[i] === 'string' 
                ? parseFloat(row.rowData[i].replace(/[^\d.-]/g, '')) 
                : row.rowData[i];
              
              if (!isNaN(value)) {
                totalRevenue += value;
              }
            }
          }
          monthData.revenue = totalRevenue;
        }
      }

      // Get expenses from the net profit sections
      if (data.netProfitSections && data.netProfitSections.length > 0) {
        let totalExpenses = 0;
        for (const section of data.netProfitSections) {
          if (section.dataRowObjects) {
            for (const row of section.dataRowObjects) {
              if (row.rowType !== "SummaryRow" && row.rowData && row.rowData.length > i) {
                const value = typeof row.rowData[i] === 'string' 
                  ? parseFloat(row.rowData[i].replace(/[^\d.-]/g, '')) 
                  : row.rowData[i];
                
                if (!isNaN(value)) {
                  totalExpenses += value;
                }
              }
            }
          }
        }
        monthData.expenses = Math.abs(totalExpenses);
      }

      // Add net profit
      if (data.netProfitDataRow && data.netProfitDataRow.length > i) {
        const profit = typeof data.netProfitDataRow[i] === 'string' 
          ? parseFloat(data.netProfitDataRow[i].replace(/[^\d.-]/g, '')) 
          : data.netProfitDataRow[i];
          
        monthData.profit = profit;
      }

      // Add gross profit
      if (data.grossProfitDataRow && data.grossProfitDataRow.length > i) {
        const grossProfit = typeof data.grossProfitDataRow[i] === 'string' 
          ? parseFloat(data.grossProfitDataRow[i].replace(/[^\d.-]/g, '')) 
          : data.grossProfitDataRow[i];
          
        monthData.grossProfit = grossProfit;
      }

      trendData.push(monthData);
    }

    // Reverse the data to show chronological order (oldest to newest)
    return trendData.reverse();
  };

  const prepareRevenueBreakdownData = () => {
    // Create data for revenue breakdown
    const revenueData = [];
    
    if (data.grossProfitSections && data.grossProfitSections.length > 0) {
      const revenueSection = data.grossProfitSections[0];
      
      // Sum across all months for each revenue type
      if (revenueSection.dataRowObjects) {
        for (const row of revenueSection.dataRowObjects) {
          if (row.rowType !== "SummaryRow") {
            let total = 0;
            for (const value of row.rowData) {
              const numValue = typeof value === 'string' 
                ? parseFloat(value.replace(/[^\d.-]/g, '')) 
                : value;
                
              if (!isNaN(numValue)) {
                total += numValue;
              }
            }
            
            if (total !== 0) {
              revenueData.push({
                name: row.rowTitle,
                value: Math.abs(total),
              });
            }
          }
        }
      }
    }
    
    return revenueData;
  };

  const prepareExpenseBreakdownData = () => {
    // Create data for expense breakdown
    const expenseData = [];
    
    if (data.netProfitSections && data.netProfitSections.length > 0) {
      // Process all expense sections
      for (const section of data.netProfitSections) {
        if (section.dataRowObjects) {
          for (const row of section.dataRowObjects) {
            if (row.rowType !== "SummaryRow") {
              let total = 0;
              for (const value of row.rowData) {
                const numValue = typeof value === 'string' 
                  ? parseFloat(value.replace(/[^\d.-]/g, '')) 
                  : value;
                  
                if (!isNaN(numValue)) {
                  total += numValue;
                }
              }
              
              // Only include non-zero expenses (negative values as expenses)
              if (total < 0) {
                expenseData.push({
                  name: row.rowTitle,
                  value: Math.abs(total), // Store as positive value for the chart
                });
              }
            }
          }
        }
      }
    }
    
    return expenseData;
  };

  const calculateFinancialMetrics = () => {
    const metrics = {
      totalRevenue: 0,
      totalExpenses: 0,
      grossProfit: 0,
      netProfit: 0,
      grossProfitMargin: 0,
      netProfitMargin: 0,
    };
    
    // Calculate total revenue
    if (data.grossProfitSections && data.grossProfitSections.length > 0) {
      const revenueSection = data.grossProfitSections[0];
      if (revenueSection.dataRowObjects) {
        for (const row of revenueSection.dataRowObjects) {
          if (row.rowType === "SummaryRow" && row.rowData) {
            for (const value of row.rowData) {
              const numValue = typeof value === 'string' 
                ? parseFloat(value.replace(/[^\d.-]/g, '')) 
                : value;
                
              if (!isNaN(numValue)) {
                metrics.totalRevenue += numValue;
              }
            }
          }
        }
      }
    }
    
    // Calculate gross profit
    if (data.grossProfitDataRow) {
      for (const value of data.grossProfitDataRow) {
        const numValue = typeof value === 'string' 
          ? parseFloat(value.replace(/[^\d.-]/g, '')) 
          : value;
          
        if (!isNaN(numValue)) {
          metrics.grossProfit += numValue;
        }
      }
    }
    
    // Calculate total expenses
    if (data.netProfitSections) {
      for (const section of data.netProfitSections) {
        if (section.dataRowObjects) {
          for (const row of section.dataRowObjects) {
            if (row.rowType !== "SummaryRow" && row.rowData) {
              for (const value of row.rowData) {
                const numValue = typeof value === 'string' 
                  ? parseFloat(value.replace(/[^\d.-]/g, '')) 
                  : value;
                  
                if (!isNaN(numValue) && numValue < 0) {
                  metrics.totalExpenses += Math.abs(numValue);
                }
              }
            }
          }
        }
      }
    }
    
    // Calculate net profit
    if (data.netProfitDataRow) {
      for (const value of data.netProfitDataRow) {
        const numValue = typeof value === 'string' 
          ? parseFloat(value.replace(/[^\d.-]/g, '')) 
          : value;
          
        if (!isNaN(numValue)) {
          metrics.netProfit += numValue;
        }
      }
    }
    
    // Calculate margins
    if (metrics.totalRevenue > 0) {
      metrics.grossProfitMargin = (metrics.grossProfit / metrics.totalRevenue) * 100;
      metrics.netProfitMargin = (metrics.netProfit / metrics.totalRevenue) * 100;
    }
    
    return metrics;
  };
  
  const monthlyTrendData = prepareMonthlyTrendData();
  const revenueBreakdownData = prepareRevenueBreakdownData();
  const expenseBreakdownData = prepareExpenseBreakdownData();
  const financialMetrics = calculateFinancialMetrics();
  
  // Custom tooltip for the financial trend chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-md shadow-md">
          <p className="text-sm font-medium text-slate-700">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Colors for the charts
  const COLORS = ['#9b87f5', '#f97316', '#0ea5e9', '#22c55e', '#ef4444'];
  
  return (
    <div className="space-y-8 mb-8">
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex mb-4">
          <TabsTrigger value="trends" className="data-[state=active]:bg-white data-[state=active]:text-navy-800">
            Financial Trends
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="data-[state=active]:bg-white data-[state=active]:text-navy-800">
            Revenue & Expenses
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-white data-[state=active]:text-navy-800">
            Key Metrics
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="trends" className="pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <ComposedChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="revenue" name="Revenue" fill="#9b87f5" />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      name="Net Profit" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="grossProfit" 
                      name="Gross Profit" 
                      stroke="#0ea5e9" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      strokeDasharray="5 5"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="breakdown" className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={revenueBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend layout={isMobile ? "horizontal" : "vertical"} align={isMobile ? "center" : "right"} verticalAlign={isMobile ? "bottom" : "middle"} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={expenseBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend layout={isMobile ? "horizontal" : "vertical"} align={isMobile ? "center" : "right"} verticalAlign={isMobile ? "bottom" : "middle"} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-lg font-medium text-slate-500">Gross Profit Margin</h3>
                  <p className="text-3xl font-bold mt-2 text-navy-800">{financialMetrics.grossProfitMargin.toFixed(1)}%</p>
                  <p className="mt-4 text-sm text-slate-500">
                    Gross Profit: {formatCurrency(financialMetrics.grossProfit)}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-lg font-medium text-slate-500">Net Profit Margin</h3>
                  <p className="text-3xl font-bold mt-2 text-navy-800">{financialMetrics.netProfitMargin.toFixed(1)}%</p>
                  <p className="mt-4 text-sm text-slate-500">
                    Net Profit: {formatCurrency(financialMetrics.netProfit)}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-lg font-medium text-slate-500">Revenue to Expense Ratio</h3>
                  <p className="text-3xl font-bold mt-2 text-navy-800">
                    {financialMetrics.totalExpenses > 0 
                      ? (financialMetrics.totalRevenue / financialMetrics.totalExpenses).toFixed(2) 
                      : 'N/A'}
                  </p>
                  <p className="mt-4 text-sm text-slate-500">
                    Revenue: {formatCurrency(financialMetrics.totalRevenue)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Expenses: {formatCurrency(financialMetrics.totalExpenses)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Profit Margin Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}%`}
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#9b87f5" />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="profit" 
                        name="Net Profit" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialYearCharts;
