import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitAndLossRow } from "@/services/financialService";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { chartConfig, useIsMobile, ResponsiveChartContainer } from '@/components/ui/chart';
import { formatCurrency } from "@/lib/utils";

interface ProfitAndLossChartProps {
  rows: ProfitAndLossRow[];
}

interface ExpenseItem {
  name: string;
  value: number;
}

const COLORS = [
  "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", 
  "#d0ed57", "#ffc658", "#ff8042", "#ff6361", "#bc5090"
];

// Update the custom label renderer
const renderCustomizedLabel = ({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent, 
  name 
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-base font-semibold" // Increased font size and made bold
      style={{ 
        fontSize: '14px',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)' // Added shadow for better readability
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const ProfitAndLossChart: React.FC<ProfitAndLossChartProps> = ({ rows }) => {
  const expensesData = useMemo(() => {
    const expensesSection = rows.find(
      (row) => row.RowType === "Section" && row.Title === "Less Operating Expenses"
    );

    if (!expensesSection || !expensesSection.Rows) return [];

    const expenses: ExpenseItem[] = [];
    
    expensesSection.Rows.forEach(row => {
      if (row.RowType === "Row" && row.Cells && row.Cells.length >= 2) {
        // Skip summary rows
        if (row.Cells[0].Value !== "Total Operating Expenses") {
          expenses.push({
            name: row.Cells[0].Value,
            value: parseFloat(row.Cells[1].Value)
          });
        }
      }
    });

    // Sort by value (descending)
    expenses.sort((a, b) => b.value - a.value);
    
    // If there are too many small values, group them as "Other"
    if (expenses.length > 9) {
      const mainExpenses = expenses.slice(0, 8);
      const otherExpenses = expenses.slice(8);
      
      const otherValue = otherExpenses.reduce((sum, item) => sum + item.value, 0);
      
      return [
        ...mainExpenses,
        { name: "Other Expenses", value: otherValue }
      ];
    }
    
    return expenses;
  }, [rows]);

  const isMobile = useIsMobile();
  const layout = isMobile ? chartConfig.mobileLayout : chartConfig.desktopLayout;

  if (expensesData.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 w-full">
      <CardHeader>
        <CardTitle>Expenses Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="relative overflow-visible px-0">
        <ResponsiveChartContainer height={isMobile ? 400 : 500}>
          <PieChart 
            margin={isMobile ? 
              { top: 20, right: 20, bottom: 20, left: 20 } : 
              { right: 340, left: 200 }
            }
          >
            <Pie
              data={expensesData}
              cx={isMobile ? "50%" : "40%"}
              cy="50%"
              outerRadius={isMobile ? 140 : 200}
              innerRadius={isMobile ? 50 : 80}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {expensesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              {...layout.legendProps}
              content={({ payload }) => (
                <div className={`p-4 ${isMobile ? 'mt-4' : ''}`}>
                  <h4 className="text-sm font-semibold text-navy-800 mb-4 pb-2 border-b">
                    Expense Categories
                  </h4>
                  <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
                    {payload?.map((entry: any, index: number) => {
                      const item = expensesData.find(d => d.name === entry.value);
                      return (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="flex-1 text-sm truncate">
                            {entry.value.toString().replace(/(.{24})..+/, '$1...')}
                          </span>
                          <span className="font-mono text-sm tabular-nums text-navy-800 shrink-0">
                            {formatCurrency(item?.value || 0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between items-center text-sm font-semibold text-navy-800">
                      <span>Total Expenses</span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(expensesData.reduce((sum, item) => sum + item.value, 0))}
                      </span>
                    </div>
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            />
          </PieChart>
        </ResponsiveChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProfitAndLossChart;
