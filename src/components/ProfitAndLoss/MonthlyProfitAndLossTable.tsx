import React, { useState } from 'react';
import { MonthlyProfitAndLoss } from '@/services/financialService';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, X } from "lucide-react";

interface MonthlyProfitAndLossTableProps {
  data: MonthlyProfitAndLoss;
}

const MonthlyProfitAndLossTable: React.FC<MonthlyProfitAndLossTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  // Filter rows based on search term
  const filterRows = (rows: any[]) => {
    if (!searchTerm) return rows;
    return rows.filter(row => 
      row.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.values.some((value: string) => 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Export to CSV function
  const exportToCSV = () => {
    // Header row
    const headers = ['Item', ...monthNames];
    
    // Data rows
    const csvRows = processedRows.map(row => {
      return [row.label, ...row.values];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly_breakdown_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = filterRows(processedRows);
  
  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-navy-800">
          Monthly Breakdown
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Filter entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[200px] bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="w-full sm:w-auto bg-white text-navy-700 border-navy-200 hover:bg-navy-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] bg-navy-50">Item</TableHead>
                {monthNames.map((month, index) => (
                  <TableHead 
                    key={index} 
                    className="min-w-[120px] text-right bg-navy-50"
                  >
                    {month}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className={
                    row.isHeader 
                      ? 'font-bold bg-navy-50/50' 
                      : row.isTotal 
                        ? 'font-semibold bg-navy-50/30' 
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
        {filteredRows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No results found for "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyProfitAndLossTable;
