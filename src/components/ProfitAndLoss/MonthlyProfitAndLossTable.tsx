
import React from 'react';
import { MonthlyProfitAndLoss } from '@/services/financialService';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface MonthlyProfitAndLossTableProps {
  data: MonthlyProfitAndLoss;
}

const MonthlyProfitAndLossTable: React.FC<MonthlyProfitAndLossTableProps> = ({ data }) => {
  if (!data || !data.Reports || !data.Reports.length) {
    return <div>No monthly data available</div>;
  }

  // Get the report
  const report = data.Reports[0];
  
  // Extract month names from column headers
  const monthNames = report.Rows[0]?.Cells?.slice(1).map(cell => cell.Value) || [];
  
  // Process rows to extract data
  const processedRows = report.Rows.slice(1).map(row => {
    // Skip header rows
    if (row.RowType === 'Header') return null;
    
    const label = row.Cells?.[0]?.Value || '';
    const values = row.Cells?.slice(1).map(cell => cell.Value) || [];
    
    return { label, values };
  }).filter(Boolean);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              {monthNames.map((month, index) => (
                <TableHead key={index}>{month}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={row.label.includes('Total') || row.label.includes('Profit') ? 'font-semibold bg-slate-50' : ''}>
                <TableCell>{row.label}</TableCell>
                {row.values.map((value, cellIndex) => (
                  <TableCell key={cellIndex} className={value.startsWith('-') ? 'text-red-600' : ''}>
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default MonthlyProfitAndLossTable;
