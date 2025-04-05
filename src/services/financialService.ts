
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

/**
 * Constructs the file path for various financial data types
 * @param businessId The client business ID
 * @param dataType The type of financial data to retrieve
 * @returns The constructed file path
 */
const getFinancialDataPath = (businessId: string, dataType: FinancialDataType): string => {
  return `/client_businesses/${businessId}/${dataType}.json`;
};

/**
 * Fetches the current financial year profit and loss data
 * @param businessId The client business ID
 * @returns Promise with the profit and loss data
 * @throws Error if businessId is null or if fetching fails
 */
export async function getProfitAndLossData(businessId: string | null): Promise<ProfitAndLossResponse> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    const response = await fetch(getFinancialDataPath(businessId, FinancialDataType.BASIC_CURRENT_YEAR));
    
    if (!response.ok) {
      throw new Error(`Failed to load profit and loss data for business ${businessId}: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching P&L data:", error);
    throw error;
  }
}

/**
 * Fetches monthly profit and loss data for the past 12 months
 * @param businessId The client business ID
 * @returns Promise with the monthly profit and loss data
 * @throws Error if businessId is null or if fetching fails
 */
export async function getMonthlyProfitAndLossData(businessId: string | null): Promise<MonthlyProfitAndLoss> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    const response = await fetch(getFinancialDataPath(businessId, FinancialDataType.MONTHLY_BREAKDOWN));
    
    if (!response.ok) {
      throw new Error(`Failed to load monthly profit and loss data for business ${businessId}: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching monthly P&L data:", error);
    throw error;
  }
}

/**
 * Fetches data for the visual dashboard display
 * @param businessId The client business ID
 * @returns Promise with the visual dashboard data
 * @throws Error if businessId is null or if fetching fails
 */
export async function getVisualDashboardData(businessId: string | null): Promise<VisualDashboardData> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    const response = await fetch(getFinancialDataPath(businessId, FinancialDataType.VISUAL_DASHBOARD));
    
    if (!response.ok) {
      throw new Error(`Failed to load visual dashboard data for business ${businessId}: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching visual dashboard data:", error);
    throw error;
  }
}
