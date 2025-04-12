
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
  VISUAL_DASHBOARD = "visualFriendlyPnlDashboardDisplay",
  ANNUAL_COMPARISON = "annualComparisonView",
  QUARTERLY_BREAKDOWN = "quarterlyBreakdown",
  DEPARTMENT_COMPARISON = "departmentCostCenterComparison",
  CUSTOM_DATE_RANGE = "customDateRangeAnalysis",
  CASH_VS_ACCRUAL = "cashVsAccrualComparison"
}

export interface ReportParams {
  fromDate?: string;
  toDate?: string;
  date?: string;
  periods?: number;
  timeframe?: "MONTH" | "QUARTER" | "YEAR";
  trackingCategoryID?: string;
  trackingOptionID?: string;
  standardLayout?: boolean;
  paymentsOnly?: boolean;
}

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
 * Get the current date
 * @returns Date string in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get the date from one year ago
 * @returns Date string in YYYY-MM-DD format
 */
export const getOneYearAgoDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split('T')[0];
};

/**
 * Get the date from first day of the last quarter
 * @returns Date string in YYYY-MM-DD format
 */
export const getFirstDayLastQuarter = (): string => {
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);
  const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
  
  // If last quarter is Q4 of previous year
  const year = lastQuarter === 3 && currentQuarter === 0 ? date.getFullYear() - 1 : date.getFullYear();
  
  const month = lastQuarter * 3; // First month of the quarter (0, 3, 6, 9)
  
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
};

/**
 * Fetches profit and loss data with custom parameters from Xero
 * @param businessId The client business ID
 * @param params Custom report parameters
 * @returns Promise with the profit and loss data
 * @throws Error if businessId is null or if fetching fails
 */
export async function getProfitAndLossWithParams(
  businessId: string | null,
  action: string = "basic-report",
  params: ReportParams
): Promise<ProfitAndLossResponse> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  // First, get the tenant ID for this business
  const { data: business, error: businessError } = await supabase
    .from('client_businesses')
    .select('tenant_id')
    .eq('id', businessId)
    .single();
  
  if (businessError || !business?.tenant_id) {
    throw new Error(`Failed to get tenant ID for business ${businessId}: ${businessError?.message || 'No tenant ID found'}`);
  }

  if (!business.tenant_id) {
    throw new Error(`Business ${businessId} has no Xero tenant ID configured. Please connect it to Xero first.`);
  }

  // Get P&L data from Xero using the invoke method with custom parameters
  const { data: result, error: functionError } = await supabase.functions.invoke('xero-financial-data', {
    body: {
      tenantId: business.tenant_id,
      action: action,
      ...params
    }
  });
  
  if (functionError) {
    throw new Error(`Failed to invoke Xero financial data function: ${functionError.message}`);
  }
  
  if (!result.success) {
    throw new Error(`Failed to get P&L data from Xero: ${result.error}`);
  }
  
  return result.data;
}

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
  // Use provided dates or defaults
  const startDate = periodStart || getDefaultStartDate();
  const endDate = periodEnd || getDefaultEndDate();

  return getProfitAndLossWithParams(
    businessId,
    "basic-report",
    {
      fromDate: startDate,
      toDate: endDate
    }
  );
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
  // Use provided dates or defaults
  const startDate = periodStart || getDefaultStartDate();
  const endDate = periodEnd || getDefaultEndDate();

  return getProfitAndLossWithParams(
    businessId,
    "monthly-breakdown",
    {
      fromDate: startDate,
      toDate: endDate,
      periods: periods,
      timeframe: "MONTH",
      standardLayout: true
    }
  ) as Promise<MonthlyProfitAndLoss>;
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
  return getProfitAndLossData(businessId, periodStart, periodEnd) as Promise<VisualDashboardData>;
}

/**
 * Fetches annual comparison P&L data (3 years) from Xero
 * @param businessId The client business ID
 * @returns Promise with the annual comparison data
 */
export async function getAnnualComparisonData(
  businessId: string | null
): Promise<ProfitAndLossResponse> {
  return getProfitAndLossWithParams(
    businessId,
    "annual-comparison",
    {}
  );
}

/**
 * Fetches quarterly breakdown P&L data from Xero
 * @param businessId The client business ID
 * @param fromDate Optional start date in YYYY-MM-DD format
 * @param toDate Optional end date in YYYY-MM-DD format
 * @returns Promise with the quarterly breakdown data
 */
export async function getQuarterlyBreakdownData(
  businessId: string | null,
  fromDate?: string,
  toDate?: string
): Promise<ProfitAndLossResponse> {
  // Default to last year if no dates provided
  const startDate = fromDate || getOneYearAgoDate();
  const endDate = toDate || getCurrentDate();

  return getProfitAndLossWithParams(
    businessId,
    "quarterly-breakdown",
    {
      fromDate: startDate,
      toDate: endDate
    }
  );
}

/**
 * Fetches department/cost center comparison P&L data from Xero
 * @param businessId The client business ID
 * @param trackingCategoryID The tracking category ID
 * @param date Optional date in YYYY-MM-DD format
 * @returns Promise with the department comparison data
 */
export async function getDepartmentComparisonData(
  businessId: string | null,
  trackingCategoryID: string,
  date?: string
): Promise<ProfitAndLossResponse> {
  const reportDate = date || getCurrentDate();

  return getProfitAndLossWithParams(
    businessId,
    "department-comparison",
    {
      date: reportDate,
      trackingCategoryID: trackingCategoryID
    }
  );
}

/**
 * Fetches custom date range P&L data from Xero
 * @param businessId The client business ID
 * @param fromDate Start date in YYYY-MM-DD format
 * @param toDate End date in YYYY-MM-DD format
 * @returns Promise with the custom date range data
 */
export async function getCustomDateRangeData(
  businessId: string | null,
  fromDate: string,
  toDate: string
): Promise<ProfitAndLossResponse> {
  return getProfitAndLossWithParams(
    businessId,
    "custom-date-range",
    {
      fromDate: fromDate,
      toDate: toDate
    }
  );
}

/**
 * Fetches cash vs accrual comparison P&L data from Xero
 * @param businessId The client business ID
 * @param date Optional date in YYYY-MM-DD format
 * @returns Promise with the cash and accrual data in an array
 */
export async function getCashVsAccrualData(
  businessId: string | null,
  date?: string
): Promise<[ProfitAndLossResponse, ProfitAndLossResponse]> {
  const reportDate = date || getCurrentDate();

  // Fetch cash basis report (payments only)
  const cashData = await getProfitAndLossWithParams(
    businessId,
    "cash-basis",
    {
      date: reportDate
    }
  );

  // Fetch accrual basis report (all transactions)
  const accrualData = await getProfitAndLossWithParams(
    businessId,
    "accrual-basis",
    {
      date: reportDate
    }
  );

  return [cashData, accrualData];
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

// Function to get tracking categories (departments/cost centers) for a business
export async function getTrackingCategories(businessId: string | null): Promise<any[]> {
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

    // Call Xero API to get tracking categories
    const { data: result, error: functionError } = await supabase.functions.invoke('xero-tracking-categories', {
      body: {
        tenantId: business.tenant_id
      }
    });
    
    if (functionError) {
      throw new Error(`Failed to invoke Xero tracking categories function: ${functionError.message}`);
    }
    
    if (!result.success) {
      throw new Error(`Failed to get tracking categories from Xero: ${result.error}`);
    }
    
    return result.data || [];
  } catch (error) {
    console.error("Error fetching tracking categories:", error);
    // Return empty array instead of throwing to handle gracefully in UI
    return [];
  }
}
