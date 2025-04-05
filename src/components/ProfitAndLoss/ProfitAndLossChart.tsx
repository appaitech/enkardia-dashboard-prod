
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitAndLossRow } from "@/services/financialService";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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

  if (expensesData.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Expenses Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {expensesData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitAndLossChart;
