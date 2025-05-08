
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinancialYearData } from "@/services/financialService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";

interface FinancialYearViewProps {
  businessId: string | null;
}

const FinancialYearView: React.FC<FinancialYearViewProps> = ({ businessId }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["financial-year", businessId, selectedYear],
    queryFn: () => getFinancialYearData(businessId, selectedYear),
    enabled: !!businessId,
  });

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  const renderYearOptions = () => {
    // Add FY 2026 to the years array
    const years = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];
    return years.map(year => (
      <SelectItem key={year} value={year.toString()}>
        FY {year}
      </SelectItem>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-slate-500">Loading financial year data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-navy-50/30 border-navy-100">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-navy-400" />
          <h2 className="mt-4 text-lg font-semibold text-navy-700">
            Error Loading Financial Year Data
          </h2>
          <p className="mt-2 text-navy-600/80">
            There was a problem retrieving financial year data
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.Reports || data.Reports.length === 0) {
    return (
      <Card className="bg-navy-50/30 border-navy-100">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-navy-400" />
          <h2 className="mt-4 text-lg font-semibold text-navy-700">
            No Financial Year Data Available
          </h2>
          <p className="mt-2 text-navy-600/80">
            There is no financial year data for this business
          </p>
        </CardContent>
      </Card>
    );
  }

  const report = data.Reports[0];
  const fromDate = `${selectedYear - 1}-03-01`;
  const toDate = `${selectedYear}-02-28`;

  const renderTableHeaders = () => {
    if (!report.Rows || report.Rows.length === 0 || !report.Rows[0].Cells) {
      return null;
    }

    return report.Rows[0].Cells.map((cell, index) => (
      <TableHead key={index} className={index === 0 ? "w-48" : "text-right"}>
        {cell.Value}
      </TableHead>
    ));
  };

  const renderTableRows = () => {
    if (!report.Rows) {
      return null;
    }

    return report.Rows.slice(1).map((section, sectionIndex) => {
      if (!section.Rows) {
        return (
          <TableRow key={`section-${sectionIndex}`}>
            <TableCell colSpan={report.Rows?.[0]?.Cells?.length || 1} className="bg-slate-50 font-semibold">
              {section.Title}
            </TableCell>
          </TableRow>
        );
      }

      return (
        <React.Fragment key={`section-${sectionIndex}`}>
          <TableRow>
            <TableCell colSpan={report.Rows?.[0]?.Cells?.length || 1} className="bg-slate-50 font-semibold">
              {section.Title}
            </TableCell>
          </TableRow>
          {section.Rows.map((row, rowIndex) => (
            <TableRow key={`section-${sectionIndex}-row-${rowIndex}`} className={row.RowType === "SummaryRow" ? "bg-slate-100 font-medium" : ""}>
              {row.Cells?.map((cell, cellIndex) => (
                <TableCell key={`section-${sectionIndex}-row-${rowIndex}-cell-${cellIndex}`} className={cellIndex === 0 ? "" : "text-right"}>
                  {cell.Value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-navy-800">
              Financial Year Statement
            </CardTitle>
            <CardDescription>
              {fromDate} to {toDate}
            </CardDescription>
          </div>
          <div className="w-[150px]">
            <Select defaultValue={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {renderYearOptions()}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {renderTableHeaders()}
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableRows()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialYearView;
