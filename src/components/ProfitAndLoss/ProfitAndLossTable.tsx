
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { ProfitAndLossRow, ProfitAndLossReport, ProfitAndLossResponse } from "@/services/financialService";

interface ProfitAndLossTableProps {
  rows: ProfitAndLossRow[];
  period: string;
  data?: ProfitAndLossResponse; // Add this for backward compatibility
}

const ProfitAndLossTable: React.FC<ProfitAndLossTableProps> = ({ rows, period, data }) => {
  // If data is provided, use its rows (backwards compatibility)
  const tableRows = data?.Reports?.[0]?.Rows || rows;
  const tablePeriod = data?.Reports?.[0]?.ReportTitles?.[0] || period;

  const renderRows = (rows: ProfitAndLossRow[], depth = 0) => {
    return rows.map((row, index) => {
      if (row.RowType === "Header") {
        return null;
      }

      if (row.RowType === "Section" && row.Rows) {
        return (
          <React.Fragment key={`section-${index}-${depth}`}>
            {row.Title && (
              <TableRow className="bg-navy-50/50">
                <TableCell
                  colSpan={2}
                  className="font-semibold py-3"
                >
                  {row.Title}
                </TableCell>
              </TableRow>
            )}
            {renderRows(row.Rows, depth + 1)}
          </React.Fragment>
        );
      }

      if (row.RowType === "SummaryRow" && row.Cells) {
        return (
          <TableRow key={`summary-${index}-${depth}`} className="font-semibold bg-navy-50/30">
            <TableCell className="py-3">
              {row.Cells[0].Value}
            </TableCell>
            <TableCell className="py-3 text-right">
              {typeof row.Cells[1].Value === 'number' 
                ? formatCurrency(row.Cells[1].Value)
                : formatCurrency(parseFloat(row.Cells[1].Value) || 0)
              }
            </TableCell>
          </TableRow>
        );
      }

      if (row.RowType === "Row" && row.Cells) {
        const paddingLeft = depth * 1.5;
        return (
          <TableRow key={`row-${index}-${depth}`} className="hover:bg-navy-50/20">
            <TableCell 
              className="py-2.5" 
              style={{ paddingLeft: `${paddingLeft + 1}rem` }}
            >
              {row.Cells[0].Value}
            </TableCell>
            <TableCell className="py-2.5 text-right">
              {typeof row.Cells[1].Value === 'number' 
                ? formatCurrency(row.Cells[1].Value)
                : formatCurrency(parseFloat(row.Cells[1].Value) || 0)
              }
            </TableCell>
          </TableRow>
        );
      }

      return null;
    });
  };

  return (
    <div className="rounded-md border border-navy-100">
      <Table>
        <TableHeader>
          <TableRow className="bg-navy-50">
            <TableHead className="w-[60%] py-3 font-semibold text-navy-800">Account</TableHead>
            <TableHead className="w-[40%] text-right py-3 font-semibold text-navy-800">{tablePeriod}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderRows(tableRows)}</TableBody>
      </Table>
    </div>
  );
};

export default ProfitAndLossTable;
