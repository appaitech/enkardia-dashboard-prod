
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { ProfitAndLossRow } from "@/services/financialService";

interface ProfitAndLossTableProps {
  rows: ProfitAndLossRow[];
  period: string;
}

const ProfitAndLossTable: React.FC<ProfitAndLossTableProps> = ({ rows, period }) => {
  const renderRows = (rows: ProfitAndLossRow[], depth = 0) => {
    return rows.map((row, index) => {
      if (row.RowType === "Header") {
        return null; // Headers are rendered separately
      }

      if (row.RowType === "Section" && row.Rows) {
        return (
          <React.Fragment key={`section-${index}-${depth}`}>
            {row.Title && (
              <TableRow className="bg-muted/40">
                <TableCell
                  colSpan={2}
                  className="font-medium py-2"
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
          <TableRow key={`summary-${index}-${depth}`} className="font-semibold bg-muted/20">
            <TableCell className="py-2 pl-4">
              {row.Cells[0].Value}
            </TableCell>
            <TableCell className="py-2 text-right">
              {formatCurrency(row.Cells[1].Value)}
            </TableCell>
          </TableRow>
        );
      }

      if (row.RowType === "Row" && row.Cells) {
        return (
          <TableRow key={`row-${index}-${depth}`}>
            <TableCell className={`py-2 pl-${4 + depth * 4}`}>
              {row.Cells[0].Value}
            </TableCell>
            <TableCell className="py-2 text-right">
              {formatCurrency(row.Cells[1].Value)}
            </TableCell>
          </TableRow>
        );
      }

      return null;
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">{period}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderRows(rows)}</TableBody>
      </Table>
    </div>
  );
};

export default ProfitAndLossTable;
