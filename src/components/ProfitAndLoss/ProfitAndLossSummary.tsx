
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ProfitAndLossReport, ProfitAndLossResponse } from "@/services/financialService";
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";

interface ProfitAndLossSummaryProps {
  report?: ProfitAndLossReport;
  data?: ProfitAndLossResponse;
}

// Helper function to find a specific row by title
const findValueByTitle = (
  rows: any[],
  title: string
): string | null => {
  for (const row of rows) {
    if (row.RowType === 'Section') {
      if (row.Rows) {
        for (const subRow of row.Rows) {
          if (subRow.RowType === 'SummaryRow' && subRow.Cells[0].Value === title) {
            return subRow.Cells[1].Value;
          }
        }
      }
    } else if (row.RowType === 'Row' && row.Cells && row.Cells[0].Value === title) {
      return row.Cells[1].Value;
    }
  }
  return null;
};

// Helper function to parse string values to numbers
const parseFinancialValue = (value: string | null): number => {
  if (!value) return 0;
  // Remove any non-numeric characters except decimal point and minus sign
  const numericValue = value.replace(/[^0-9.-]/g, '');
  return parseFloat(numericValue) || 0;
};

const ProfitAndLossSummary: React.FC<ProfitAndLossSummaryProps> = ({ report, data }) => {
  // Use report if provided directly, otherwise try to get it from data
  const summaryReport = report || (data?.Reports?.[0]);
  
  if (!summaryReport) {
    return <div>No summary data available</div>;
  }

  const totalIncome = findValueByTitle(summaryReport.Rows, 'Total Income') || '0';
  const totalCostOfSales = findValueByTitle(summaryReport.Rows, 'Total Cost of Sales') || '0';
  const totalExpenses = findValueByTitle(summaryReport.Rows, 'Total Operating Expenses') || '0';
  const netProfit = findValueByTitle(summaryReport.Rows, 'Net Profit') || '0';
  const grossProfit = findValueByTitle(summaryReport.Rows, 'Gross Profit') || '0';

  // Parse string values to numbers for formatCurrency
  const totalIncomeValue = parseFinancialValue(totalIncome);
  const grossProfitValue = parseFinancialValue(grossProfit);
  const totalExpensesValue = parseFinancialValue(totalExpenses);
  const netProfitValue = parseFinancialValue(netProfit);

  const isProfit = netProfitValue >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-green-500" />
            <span className="text-2xl font-bold">{formatCurrency(totalIncomeValue)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gross Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
            <span className="text-2xl font-bold">{formatCurrency(grossProfitValue)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-amber-500" />
            <span className="text-2xl font-bold">{formatCurrency(totalExpensesValue)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {isProfit ? (
              <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownCircle className="mr-2 h-4 w-4 text-red-500" />
            )}
            <span className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfitValue)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitAndLossSummary;
