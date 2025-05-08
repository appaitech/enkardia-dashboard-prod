
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfitAndLossResponse } from "@/services/financialService";
import { formatDate } from "@/utils/formatters";
import ProfitAndLossTable from "./ProfitAndLossTable";

interface CashVsAccrualViewProps {
  cashData: ProfitAndLossResponse;
  accrualData: ProfitAndLossResponse;
  reportDate: string;
}

const CashVsAccrualView: React.FC<CashVsAccrualViewProps> = ({
  cashData,
  accrualData,
  reportDate
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-navy-800">
            Cash vs Accrual Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Report Date: {formatDate(new Date(reportDate))}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="accrual">
            <TabsList className="mb-6">
              <TabsTrigger value="accrual">Accrual Basis</TabsTrigger>
              <TabsTrigger value="cash">Cash Basis</TabsTrigger>
            </TabsList>
            <TabsContent value="accrual">
              {accrualData?.Reports?.[0] && (
                <ProfitAndLossTable 
                  rows={accrualData.Reports[0].Rows} 
                  period={accrualData.Reports[0].ReportTitles?.[0] || "Accrual Basis"} 
                />
              )}
            </TabsContent>
            <TabsContent value="cash">
              {cashData?.Reports?.[0] && (
                <ProfitAndLossTable 
                  rows={cashData.Reports[0].Rows} 
                  period={cashData.Reports[0].ReportTitles?.[0] || "Cash Basis"} 
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashVsAccrualView;
