
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
  
  // Extract month names from report headers
  // In the JSON structure, the column headers are in the report's Fields array
  const monthNames = report.Fields
    .filter(field => field.Id === 'Period' || field.Id === 'Column')
    .map(field => field.Value);
  
  // Process rows to extract data
  const processRows = (rows: any[], level = 0) => {
    return rows.map(row => {
      if (row.RowType === 'Header' || row.RowType === 'Section') {
        // Skip section headers or process them differently if needed
        return null;
      }

      // Get the label from the first cell
      const label = row.Title || '';
      
      // For regular rows and summary rows, extract the values
      const values = row.Cells?.map((cell: any) => cell.Value) || [];
      
      const isTotal = label.includes('Total') || row.RowType === 'SummaryRow';
      const isProfit = label.includes('Profit') || label.includes('Loss');
      
      return {
        label,
        values,
        level,
        isTotal: isTotal || isProfit,
      };
    }).filter(Boolean);
  };
  
  // Get all rows including nested sections
  const getAllRows = (rows: any[], level = 0) => {
    let allRows: any[] = [];
    
    rows.forEach(row => {
      if (row.RowType === 'Section') {
        // Add section header first
        allRows.push({
          label: row.Title,
          values: row.Cells?.map((cell: any) => cell.Value) || [],
          level,
          isHeader: true,
        });
        
        // Then add all rows in this section, including nested sections
        if (row.Rows && row.Rows.length) {
          allRows = [...allRows, ...getAllRows(row.Rows, level + 1)];
        }
      } else {
        // Process non-section rows
        const processedRow = processRows([row], level)[0];
        if (processedRow) {
          allRows.push(processedRow);
        }
      }
    });
    
    return allRows;
  };
  
  const processedRows = getAllRows(report.Rows);
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Item</TableHead>
              {monthNames.map((month, index) => (
                <TableHead key={index} className="min-w-[120px] text-right">
                  {month}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedRows.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex} 
                className={
                  row.isHeader 
                    ? 'font-bold bg-slate-100' 
                    : row.isTotal 
                      ? 'font-semibold bg-slate-50' 
                      : ''
                }
              >
                <TableCell 
                  className={`${row.level > 0 ? 'pl-' + (row.level * 6) : ''}`}
                >
                  {row.label}
                </TableCell>
                {row.values.map((value: string, cellIndex: number) => (
                  <TableCell 
                    key={cellIndex} 
                    className={`text-right ${value && value.startsWith('-') ? 'text-red-600' : ''}`}
                  >
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
