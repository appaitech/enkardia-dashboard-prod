
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getProfitAndLossData } from "@/services/financialService";
import ProfitAndLossSummary from "@/components/ProfitAndLoss/ProfitAndLossSummary";
import ProfitAndLossTable from "@/components/ProfitAndLoss/ProfitAndLossTable";
import ProfitAndLossChart from "@/components/ProfitAndLoss/ProfitAndLossChart";
import UserSidebar from "@/components/UserSidebar";
import { FileText, Loader2, RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfitAndLossPage: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["profit-and-loss"],
    queryFn: getProfitAndLossData,
  });

  let period = "";
  if (data?.Reports?.[0]?.Rows?.[0]?.Cells?.[1]?.Value) {
    period = data.Reports[0].Rows[0].Cells[1].Value;
  }

  let pageContent;

  if (isLoading) {
    pageContent = (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  } else if (isError) {
    pageContent = (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
          <p className="mt-2 text-muted-foreground">There was a problem loading the financial data</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  } else if (!data?.Reports?.[0]) {
    pageContent = (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">No Data Available</h2>
          <p className="mt-2 text-muted-foreground">
            No profit and loss data is available for this period
          </p>
        </div>
      </div>
    );
  } else {
    const report = data.Reports[0];
    
    pageContent = (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {report.ReportName}
          </h1>
          <div className="text-muted-foreground mt-1">
            {report.ReportTitles?.[1]} • {report.ReportTitles?.[2]}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Report Date: {report.ReportDate}
          </div>
        </div>
      
        <ProfitAndLossSummary report={report} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfitAndLossChart rows={report.Rows} />
          
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Detail</CardTitle>
              <CardDescription>
                Detailed breakdown of income and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfitAndLossTable rows={report.Rows} period={period} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <UserSidebar activePath="/user/financial/profit-loss" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {pageContent}
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLossPage;
