import { supabase } from "@/integrations/supabase/client";

export interface ProfitAndLossRow {
  RowType: string;
  Title?: string;
  Cells?: {
    Value: string;
    Attributes?: {
      Value: string;
      Id: string;
    }[];
  }[];
  Rows?: ProfitAndLossRow[];
}

export interface ProfitAndLossReport {
  ReportID: string;
  ReportName: string;
  ReportType: string;
  ReportTitles: string[];
  ReportDate: string;
  UpdatedDateUTC: string;
  Fields: {
    Id: string;
    Value: string;
  }[];
  Rows: ProfitAndLossRow[];
}

export interface ProfitAndLossResponse {
  Id: string;
  Status: string;
  ProviderName: string;
  DateTimeUTC: string;
  Reports: ProfitAndLossReport[];
}

export interface MonthlyProfitAndLoss {
  Id: string;
  Status: string;
  ProviderName: string;
  DateTimeUTC: string;
  Reports: ProfitAndLossReport[]; // Monthly reports have the same structure but with multiple periods
}

export interface VisualDashboardData {
  Id: string;
  Status: string;
  ProviderName: string;
  DateTimeUTC: string;
  Reports: ProfitAndLossReport[]; // Same structure as other reports
}

export enum FinancialDataType {
  BASIC_CURRENT_YEAR = "basicCurrentFinancialYear",
  MONTHLY_BREAKDOWN = "monthByMonthBreakdownLast12Months",
  VISUAL_DASHBOARD = "visualFriendlyPnlDashboardDisplay"
}

const getFinancialDataPath = (businessId: string, dataType: FinancialDataType): string => {
  return `/client_businesses/${businessId}/${dataType}.json`;
};

export async function getProfitAndLossData(businessId: string | null): Promise<ProfitAndLossResponse> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    const response = await fetch(getFinancialDataPath(businessId, FinancialDataType.BASIC_CURRENT_YEAR));
    
    if (!response.ok) {
      throw new Error(`Failed to load profit and loss data for business ${businessId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching P&L data:", error);
    throw error;
  }
}

export async function getMonthlyProfitAndLossData(businessId: string | null): Promise<MonthlyProfitAndLoss> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    const response = await fetch(getFinancialDataPath(businessId, FinancialDataType.MONTHLY_BREAKDOWN));
    
    if (!response.ok) {
      throw new Error(`Failed to load monthly profit and loss data for business ${businessId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching monthly P&L data:", error);
    throw error;
  }
}

export async function getVisualDashboardData(businessId: string | null): Promise<VisualDashboardData> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    const response = await fetch(getFinancialDataPath(businessId, FinancialDataType.VISUAL_DASHBOARD));
    
    if (!response.ok) {
      throw new Error(`Failed to load visual dashboard data for business ${businessId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching visual dashboard data:", error);
    throw error;
  }
}
