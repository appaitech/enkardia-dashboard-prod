
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinancialYearData } from "@/services/financialService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";

import { DataModel, useFinancialStore } from '@/store/financialStore'

import FinancialDashboardView from "@/components/ProfitAndLoss/FinancialDashboardView";

interface FinancialYearViewProps {
  businessId: string | null;
}

const FinancialYearView: React.FC<FinancialYearViewProps> = ({ businessId }) => {
  const { data: dataModel, setData } = useFinancialStore();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  console.log('dataModel', dataModel);
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["financial-year", dataModel?.selectedClientId, selectedYear],
    queryFn: () => getFinancialYearData(dataModel?.selectedClientId, selectedYear),
    enabled: !!dataModel?.selectedClientId,
  });

  // const { data, refetch, isFetching } = useQuery({
  //   queryKey: ['financials', orgId],
  //   queryFn: () => fetchFinancials(orgId),
  //   enabled: false, // don’t fetch automatically
  // })

  // later in your code
  useEffect(() => {
    console.log('businessId 111111', businessId);
    if (businessId) {
      console.log('businessId 2222222', businessId);
      refetch();
    }
  }, [businessId])



  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  // HOoks
  useEffect(() => {
      console.log('dataModel?.selectedClientId', dataModel?.selectedClientId);
    }, [dataModel?.selectedClientId]);

  const renderYearOptions = () => {
    // Add FY 2026 to the years array
    const years = [currentYear + 1, currentYear]; // , currentYear - 1, currentYear - 2
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

  if (!data) {
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

  const fromDate = `${selectedYear - 1}-03-01`;
  const toDate = `${selectedYear}-02-28`;

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
          <FinancialYearTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

// Create a new component specifically for the Financial Year table
const FinancialYearTable = ({ data }: { data: any }) => {
  if (!data || !data.headings || data.headings.length === 0) {
    return <div>No data available</div>;
  }

  const renderGrossProfit = () => {
    return (
      <>
        {data.grossProfitSections.map((section, sectionIndex) => (
          <React.Fragment key={`gross-section-${sectionIndex}`}>
            <TableRow>
              <TableCell colSpan={data.headings.length + 1} className="bg-slate-50 font-semibold">
                {section.title}
              </TableCell>
            </TableRow>
            {section.dataRowObjects.map((row, rowIndex) => (
              <TableRow 
                key={`gross-row-${sectionIndex}-${rowIndex}`} 
                className={row.rowType === "SummaryRow" ? "bg-slate-100 font-medium" : ""}
              >
                <TableCell>{row.rowTitle}</TableCell>
                {row.rowData.map((cell, cellIndex) => (
                  <TableCell key={`gross-cell-${sectionIndex}-${rowIndex}-${cellIndex}`} className="text-right">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </React.Fragment>
        ))}
        <TableRow className="bg-navy-50/30 font-semibold">
          <TableCell>Gross Profit</TableCell>
          {data.grossProfitDataRow.map((value, index) => (
            <TableCell key={`gross-profit-${index}`} className="text-right">{value}</TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const renderNetProfit = () => {
    return (
      <>
        {data.netProfitSections.map((section, sectionIndex) => (
          <React.Fragment key={`net-section-${sectionIndex}`}>
            <TableRow>
              <TableCell colSpan={data.headings.length + 1} className="bg-slate-50 font-semibold">
                {section.title}
              </TableCell>
            </TableRow>
            {section.dataRowObjects.map((row, rowIndex) => (
              <TableRow 
                key={`net-row-${sectionIndex}-${rowIndex}`} 
                className={row.rowType === "SummaryRow" ? "bg-slate-100 font-medium" : ""}
              >
                <TableCell>{row.rowTitle}</TableCell>
                {row.rowData.map((cell, cellIndex) => (
                  <TableCell key={`net-cell-${sectionIndex}-${rowIndex}-${cellIndex}`} className="text-right">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </React.Fragment>
        ))}
        <TableRow className="bg-navy-50/30 font-semibold">
          <TableCell>Net Profit</TableCell>
          {data.netProfitDataRow.map((value, index) => (
            <TableCell key={`net-profit-${index}`} className="text-right">{value}</TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  return (
    <>
      <FinancialDashboardView inputData={data}/>

      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">Account</TableHead>
            {data.headings.map((heading, index) => (
              <TableHead key={`heading-${index}`} className="text-right">
                {heading}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderGrossProfit()}
          {renderNetProfit()}
        </TableBody>
      </Table>
    </>
    
  );
};

export default FinancialYearView;
