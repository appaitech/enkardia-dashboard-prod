
import React, { useState, useEffect } from 'react';
import { ProfitAndLossResponse, getTrackingCategories } from '@/services/financialService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DepartmentComparisonViewProps {
  data: ProfitAndLossResponse | null;
  businessId: string | null;
  onTrackingCategorySelect: (categoryId: string) => void;
  isLoading: boolean;
}

const DepartmentComparisonView: React.FC<DepartmentComparisonViewProps> = ({ 
  data, 
  businessId, 
  onTrackingCategorySelect,
  isLoading
}) => {
  const [trackingCategories, setTrackingCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      if (businessId) {
        setIsLoadingCategories(true);
        try {
          const categories = await getTrackingCategories(businessId);
          setTrackingCategories(categories);
          
          // Auto-select the first category if available
          if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0].TrackingCategoryID);
            onTrackingCategorySelect(categories[0].TrackingCategoryID);
          }
        } catch (error) {
          console.error("Error fetching tracking categories:", error);
        } finally {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();
  }, [businessId]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onTrackingCategorySelect(categoryId);
  };

  if (isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-slate-500">Loading departments...</p>
      </div>
    );
  }

  if (trackingCategories.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-700">No Tracking Categories Available</h3>
        <p className="mt-2 text-slate-500">
          Your Xero account doesn't have any tracking categories (departments) set up. 
          Please add tracking categories in Xero to use this view.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-slate-500">Loading department data...</p>
      </div>
    );
  }

  if (!data || !data.Reports || !data.Reports.length) {
    return (
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Department/Cost Center</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {trackingCategories.map((category) => (
                <SelectItem key={category.TrackingCategoryID} value={category.TrackingCategoryID}>
                  {category.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-center p-8 border rounded-lg bg-slate-50">
          <p>No department comparison data available</p>
          <p className="text-sm text-slate-500 mt-2">Please select a department from the dropdown above</p>
        </div>
      </div>
    );
  }

  const report = data.Reports[0];
  
  // Extract tracking options (departments) from column headers
  const departments = report.Rows[0]?.Cells?.slice(1).map(cell => cell.Value) || [];
  
  // Extract revenue, expenses, and net profit data for each department
  const departmentData = {
    revenue: [] as number[],
    expenses: [] as number[],
    netProfit: [] as number[],
    profitMargin: [] as number[]
  };
  
  // Process rows to extract department data
  for (const section of report.Rows) {
    if (section.Title === 'Income' && section.Rows) {
      const summaryRow = section.Rows.find(row => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells) {
        // Skip first cell (it's the label) and extract values for each department
        departmentData.revenue = summaryRow.Cells.slice(1).map(cell => 
          parseFloat(cell.Value.replace(/,/g, ''))
        );
      }
    }
    else if (section.Title === 'Less Operating Expenses' && section.Rows) {
      const summaryRow = section.Rows.find(row => row.RowType === 'SummaryRow');
      if (summaryRow && summaryRow.Cells) {
        departmentData.expenses = summaryRow.Cells.slice(1).map(cell => 
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
      departmentData.netProfit = netProfitRow.Cells.slice(1).map(cell => 
        parseFloat(cell.Value.replace(/,/g, ''))
      );
    }
  }
  
  // Calculate profit margins
  departmentData.profitMargin = departmentData.revenue.map((rev, index) => 
    rev !== 0 ? (departmentData.netProfit[index] / rev) * 100 : 0
  );
  
  // Prepare chart data for department comparison
  const comparisonChartData = departments.map((dept, index) => ({
    name: dept,
    Revenue: departmentData.revenue[index] || 0,
    Expenses: departmentData.expenses[index] || 0,
    'Net Profit': departmentData.netProfit[index] || 0,
    'Profit Margin': departmentData.profitMargin[index] || 0
  }));

  // Prepare pie chart data for revenue distribution
  const revenuePieData = departments.map((dept, index) => ({
    name: dept,
    value: departmentData.revenue[index] || 0
  })).filter(item => item.value > 0);

  // Prepare pie chart data for expense distribution
  const expensePieData = departments.map((dept, index) => ({
    name: dept,
    value: departmentData.expenses[index] || 0
  })).filter(item => item.value > 0);

  // Colors for charts
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#14b8a6', '#8b5cf6', '#f43f5e'];

  const selectedCategoryName = trackingCategories.find(cat => cat.TrackingCategoryID === selectedCategory)?.Name || 'Department';

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Department/Cost Center</label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            {trackingCategories.map((category) => (
              <SelectItem key={category.TrackingCategoryID} value={category.TrackingCategoryID}>
                {category.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept, index) => {
          const revenue = departmentData.revenue[index] || 0;
          const expenses = departmentData.expenses[index] || 0;
          const profit = departmentData.netProfit[index] || 0;
          const isProfitable = profit >= 0;
          
          return (
            <Card key={dept} className={`${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-slate-500">{dept}</h3>
                <p className="text-2xl font-bold">{formatCurrency(profit)}</p>
                <div className="flex items-center mt-1">
                  {isProfitable ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-xs ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {revenue > 0 ? (profit / revenue * 100).toFixed(1) : 0}% margin
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedCategoryName} Comparison</CardTitle>
          <CardDescription>Revenue, expenses and profit by {selectedCategoryName.toLowerCase()}</CardDescription>
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Profit Margin') {
                      return [`${Number(value).toFixed(1)}%`, name];
                    }
                    return [formatCurrency(value as number), name];
                  }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>By {selectedCategoryName.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenuePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenuePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>By {selectedCategoryName.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedCategoryName} Details</CardTitle>
          <CardDescription>Key metrics by {selectedCategoryName.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b pb-2 text-left font-medium">{selectedCategoryName}</th>
                  <th className="border-b pb-2 text-right font-medium">Revenue</th>
                  <th className="border-b pb-2 text-right font-medium">Expenses</th>
                  <th className="border-b pb-2 text-right font-medium">Net Profit</th>
                  <th className="border-b pb-2 text-right font-medium">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => {
                  const revenue = departmentData.revenue[index] || 0;
                  const expenses = departmentData.expenses[index] || 0; 
                  const netProfit = departmentData.netProfit[index] || 0;
                  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
                  
                  return (
                    <tr key={dept} className="border-b border-muted">
                      <td className="py-3 text-left">{dept}</td>
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

export default DepartmentComparisonView;
