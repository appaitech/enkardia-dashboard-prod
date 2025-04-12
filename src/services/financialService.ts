
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
 * Constructs the file path for various financial data types (used for fallback)
 * @param businessId The client business ID
 * @param dataType The type of financial data to retrieve
 * @returns The constructed file path
 */
const getFinancialDataPath = (businessId: string, dataType: FinancialDataType): string => {
  return `/client_businesses/${businessId}/${dataType}.json`;
};

/**
 * Get the default start date (January 1st of current year)
 * @returns Date string in YYYY-MM-DD format
 */
export const getDefaultStartDate = (): string => {
  const currentDate = new Date();
  return `${currentDate.getFullYear()}-01-01`;
};

/**
 * Get the default end date (today)
 * @returns Date string in YYYY-MM-DD format
 */
export const getDefaultEndDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Fetches the current financial year profit and loss data from Xero
 * @param businessId The client business ID
 * @param periodStart Optional start date in YYYY-MM-DD format
 * @param periodEnd Optional end date in YYYY-MM-DD format
 * @returns Promise with the profit and loss data
 * @throws Error if businessId is null or if fetching fails
 */
export async function getProfitAndLossData(
  businessId: string | null, 
  periodStart?: string, 
  periodEnd?: string
): Promise<ProfitAndLossResponse> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    // First, get the tenant ID for this business
    const { data: business, error: businessError } = await supabase
      .from('client_businesses')
      .select('tenant_id')
      .eq('id', businessId)
      .single();
    
    if (businessError || !business?.tenant_id) {
      throw new Error(`Failed to get tenant ID for business ${businessId}: ${businessError?.message || 'No tenant ID found'}`);
    }

    // Use provided dates or defaults
    const startDate = periodStart || getDefaultStartDate();
    const endDate = periodEnd || getDefaultEndDate();

    // Get P&L data from Xero using the invoke method
    const { data: result, error: functionError } = await supabase.functions.invoke('xero-financial-data', {
      body: {
        tenantId: business.tenant_id,
        reportType: 'ProfitAndLoss',
        periodStart: startDate,
        periodEnd: endDate
      }
    });
    
    if (functionError) {
      throw new Error(`Failed to invoke Xero financial data function: ${functionError.message}`);
    }
    
    if (!result.success) {
      throw new Error(`Failed to get P&L data from Xero: ${result.error}`);
    }
    
    return result.data;
  } catch (error) {
    console.error("Error fetching P&L data:", error);
    
    // Try fallback to local data
    try {
      const fallbackResponse = await fetch(getFinancialDataPath(businessId, FinancialDataType.BASIC_CURRENT_YEAR));
      if (!fallbackResponse.ok) {
        throw error; // Throw original error if fallback also fails
      }
      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw error; // Throw original error
    }
  }
}

/**
 * Fetches monthly profit and loss data for the past 12 months from Xero
 * @param businessId The client business ID
 * @param periodStart Optional start date in YYYY-MM-DD format
 * @param periodEnd Optional end date in YYYY-MM-DD format
 * @param periods Optional number of periods to include
 * @returns Promise with the monthly profit and loss data
 * @throws Error if businessId is null or if fetching fails
 */
export async function getMonthlyProfitAndLossData(
  businessId: string | null,
  periodStart?: string,
  periodEnd?: string,
  periods: number = 6
): Promise<MonthlyProfitAndLoss> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    // Get the tenant ID for this business
    const { data: business, error: businessError } = await supabase
      .from('client_businesses')
      .select('tenant_id')
      .eq('id', businessId)
      .single();
    
    if (businessError || !business?.tenant_id) {
      throw new Error(`Failed to get tenant ID for business ${businessId}: ${businessError?.message || 'No tenant ID found'}`);
    }

    // Use provided dates or defaults
    const startDate = periodStart || getDefaultStartDate();
    const endDate = periodEnd || getDefaultEndDate();

    // Get monthly P&L data from Xero using the invoke method
    const { data: result, error: functionError } = await supabase.functions.invoke('xero-financial-data', {
      body: {
        tenantId: business.tenant_id,
        reportType: 'ProfitAndLoss',
        periodStart: startDate,
        periodEnd: endDate,
        periods: periods,
        timeframe: 'MONTH',
        standardLayout: true
      }
    });
    
    if (functionError) {
      throw new Error(`Failed to invoke Xero financial data function: ${functionError.message}`);
    }
    
    if (!result.success) {
      throw new Error(`Failed to get monthly P&L data from Xero: ${result.error}`);
    }
    
    return result.data;
  } catch (error) {
    console.error("Error fetching monthly P&L data:", error);
    
    // Try fallback to local data
    try {
      const fallbackResponse = await fetch(getFinancialDataPath(businessId, FinancialDataType.MONTHLY_BREAKDOWN));
      if (!fallbackResponse.ok) {
        throw error; // Throw original error if fallback also fails
      }
      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw error; // Throw original error
    }
  }
}

/**
 * Fetches data for the visual dashboard display from Xero
 * @param businessId The client business ID
 * @param periodStart Optional start date in YYYY-MM-DD format
 * @param periodEnd Optional end date in YYYY-MM-DD format
 * @returns Promise with the visual dashboard data
 * @throws Error if businessId is null or if fetching fails
 */
export async function getVisualDashboardData(
  businessId: string | null,
  periodStart?: string,
  periodEnd?: string
): Promise<VisualDashboardData> {
  // For the visual dashboard, we'll use the same data as the profit and loss data
  // with specified date ranges
  return getProfitAndLossData(businessId, periodStart, periodEnd) as Promise<VisualDashboardData>;
}

/**
 * Gets the Xero connection associated with a client business
 * @param businessId The client business ID
 * @returns Promise with the Xero connection if found
 */
export async function getXeroConnectionForBusiness(businessId: string): Promise<any> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    const { data, error } = await supabase
      .from('client_businesses')
      .select(`
        id,
        tenant_id,
        xero_connections:xero_connections(*)
      `)
      .eq('id', businessId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data?.xero_connections?.length ? data.xero_connections[0] : null;
  } catch (error) {
    console.error("Error fetching Xero connection for business:", error);
    throw error;
  }
}

/**
 * Fetches a summary of key financial metrics for a business from Xero data
 * @param businessId The client business ID
 * @returns Promise with summary financial data
 */
export async function getFinancialSummary(businessId: string | null): Promise<any> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    // Get the PnL data which we'll use to calculate summary metrics
    const pnlData = await getProfitAndLossData(businessId);
    
    // Extract summary data from the report
    const report = pnlData.Reports[0];
    const summaryData = {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      grossMargin: 0
    };
    
    // Process the rows to extract summary information
    if (report && report.Rows) {
      for (const section of report.Rows) {
        if (section.Title === 'Income' && section.Rows) {
          const incomeTotal = section.Rows.find(row => row.RowType === 'SummaryRow');
          if (incomeTotal && incomeTotal.Cells && incomeTotal.Cells[1]) {
            summaryData.totalRevenue = parseFloat(incomeTotal.Cells[1].Value.replace(/,/g, ''));
          }
        }
        else if (section.Title === 'Less Operating Expenses' && section.Rows) {
          const expensesTotal = section.Rows.find(row => row.RowType === 'SummaryRow');
          if (expensesTotal && expensesTotal.Cells && expensesTotal.Cells[1]) {
            summaryData.totalExpenses = parseFloat(expensesTotal.Cells[1].Value.replace(/,/g, ''));
          }
        }
      }
    }
    
    // Calculate net profit
    summaryData.netProfit = summaryData.totalRevenue - summaryData.totalExpenses;
    
    // Calculate gross margin percentage
    if (summaryData.totalRevenue > 0) {
      summaryData.grossMargin = (summaryData.netProfit / summaryData.totalRevenue) * 100;
    }
    
    return summaryData;
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    throw error;
  }
}
