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

// MOD CUSTOM INTERFACES START
export interface FinancialYearProfitAndLossModel {
  headings: string[],
  grossProfitSections: ProfitSectionModel[],
  grossProfitDataRow: string[],
  netProfitSections: ProfitSectionModel[],
  netProfitDataRow: string[],
}

export interface ProfitSectionModel {
  title: string,
  dataRowObjects: DataRowObject[]
}

export interface DataRowObject {
  rowType: `Row` | `SummaryRow`,
  rowTitle: string,
  rowData: string[]
}
// MOD CUSTOM INTERFACES END

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
  CASH_VS_ACCRUAL = "cashVsAccrualComparison",
  FINANCIAL_YEAR = "financialYearStatement"
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
 * Get the financial year start date based on the year
 * @param year The financial year (e.g. 2025 means FY2025 which starts in 2024)
 * @returns Date string in YYYY-MM-DD format
 */
export const getFinancialYearStartDate = (year: number): string => {
  return `${year - 1}-03-01`;
};

/**
 * Get the financial year end date based on the year
 * @param year The financial year (e.g. 2025 means FY2025 which ends in 2025)
 * @returns Date string in YYYY-MM-DD format
 */
export const getFinancialYearEndDate = (year: number): string => {
  return `${year}-02-28`;
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

// CUSTOM function to merge data START
const buildAndPopulateProfitSection = (inputXeroReportRow, inputReportDataArray, inputPropertyName, inputInitialHeadingsCount) => {

  // TODO - got all the row headings now
  // TODO - need to loop through and create table template,

  const title = inputXeroReportRow.Title;
  const rows = inputXeroReportRow.Rows;
  
  const existingSection = inputReportDataArray[inputPropertyName].find(x => x.title === title);

  if (existingSection) {
    rows.forEach((row: ProfitAndLossRow) => {
      const cells = row.Cells;
      const rowTitle = cells[0].Value;

      const existingDataRowObject = existingSection.dataRowObjects.find(x => x.rowTitle === rowTitle)

      if (existingDataRowObject) {
        cells.forEach((cell, index) => {
          if (index === 0)
            return;

          existingDataRowObject.rowData.push(cell.Value);
        });
      }
      else {
        const dataRowObject = {
          rowType: row.RowType,
          rowTitle: rowTitle,
          rowData: [],
        };

        for (let k = 0; k < inputInitialHeadingsCount; k++) {
          dataRowObject.rowData.push(`0.00`);
        }

        cells.forEach((cell, index) => {
          if (index === 0)
            return;

          dataRowObject.rowData.push(cell.Value);
        });

        existingSection.dataRowObjects.push(dataRowObject);
      }
    });
  }
  else {
    const sectionObject = {
      title: title,
      dataRowObjects: []          
    };

    rows.forEach((row: ProfitAndLossRow) => {
      const cells = row.Cells;
      const rowTitle = cells[0].Value;

      const dataRowObject = {
        rowType: row.RowType,
        rowTitle: rowTitle,
        rowData: [],
      };

      cells.forEach((cell, index) => {
        if (index === 0)
          return;

        dataRowObject.rowData.push(cell.Value);
      });

      sectionObject.dataRowObjects.push(dataRowObject);
    });

    inputReportDataArray[inputPropertyName].push(sectionObject);
  }
}


const buildProfitAndLossReportDataArray = (xeroReportRows: ProfitAndLossRow[], inputReportDataArray: FinancialYearProfitAndLossModel = null, inputRowHeadings: string[]): FinancialYearProfitAndLossModel => {
  let reportDataArray: FinancialYearProfitAndLossModel = {
    headings: [],
    grossProfitSections: [],
    grossProfitDataRow: [],
    netProfitSections: [],
    netProfitDataRow: [],
  };

  if (inputReportDataArray !== null)
    reportDataArray = inputReportDataArray;

  const initialHeadingsCount = reportDataArray.headings.length;

  let isGrossProfitSectionFlag = true;

  let headerCount = 0;

  xeroReportRows.forEach((xeroReportRow: ProfitAndLossRow, index) => {
    if (isHeaderRow(xeroReportRow)) {
      const cells = xeroReportRow.Cells;
      cells.forEach((cell, index) => {
        if (index === 0)
          return;

        reportDataArray.headings.push(cell.Value);
        headerCount++;
      });

      return;
    }

    if (isGrossProfitSection(xeroReportRow)) {
      // indicating it has now ended
      isGrossProfitSectionFlag = false;

      const cells = xeroReportRow.Rows[0].Cells;

      cells.forEach((cell, index) => {
        if (index === 0)
          return;

        reportDataArray.grossProfitDataRow.push(cell.Value);
      });

      return;
    }

    if (isNetProfitSection(xeroReportRow)) {
      const cells = xeroReportRow.Rows[0].Cells;

      cells.forEach((cell, index) => {
        if (index === 0)
          return;
        
        reportDataArray.netProfitDataRow.push(cell.Value);
      });

      return;
    }

    if (isGrossProfitSectionFlag && isSectionRow(xeroReportRow)) { // && 
      buildAndPopulateProfitSection(xeroReportRow, reportDataArray, `grossProfitSections`, initialHeadingsCount);
      return;
    }

    if (!isGrossProfitSectionFlag && isSectionRow(xeroReportRow)) { // && 
      buildAndPopulateProfitSection(xeroReportRow, reportDataArray, `netProfitSections`, initialHeadingsCount);
      return;
    }
  });

  reportDataArray.grossProfitSections.forEach((section) => {
    section.dataRowObjects.forEach((dataRowObject) => {
      if (dataRowObject.rowData.length === initialHeadingsCount)
      {
        for (let k = 0; k < headerCount; k++) 
        {
          dataRowObject.rowData.push(`0.00`);
        }
      }
    });
  });

  reportDataArray.netProfitSections.forEach((section) => {
    section.dataRowObjects.forEach((dataRowObject) => {
      if (dataRowObject.rowData.length === initialHeadingsCount)
      {
        for (let k = 0; k < headerCount; k++) 
        {
          dataRowObject.rowData.push(`0.00`);
        }
      }
    });
  });

  return reportDataArray;
}



const isDataRow = (rowObject: ProfitAndLossRow) => {
  return rowObject.RowType === `Row`;
}

const isSummaryROw = (rowObject: ProfitAndLossRow) => {
  return rowObject.RowType === `SummaryRow`
}
// CUSTOM function to merge data END

function getLastDayOfFebruary(year) {
  // Create a date for March 1st of the given year
  const marchFirst = new Date(`${year}-03-01T00:00:00`);
  
  // Subtract 1 second to get February's last day
  const lastDayOfFeb = new Date(marchFirst.getTime() - 1000);
  
  // Format to get the day as a 2-digit string
  const day = String(lastDayOfFeb.getDate()).padStart(2, '0');
  
  return day;
}

/**
 * Fetches financial year profit and loss data from Xero
 * @param businessId The client business ID
 * @param year The financial year (e.g. 2025 for FY2025)
 * @returns Promise with the profit and loss data
 * @throws Error if businessId is null or if fetching fails
 */
// MonthlyProfitAndLoss
export async function getFinancialYearData(
  businessId: string | null, 
  year: number = new Date().getFullYear()
): Promise<FinancialYearProfitAndLossModel> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  // const fromDate = getFinancialYearStartDate(year);
  // const toDate = getFinancialYearEndDate(year);
  // console.log(`Fetching financial year data for ${year}: ${fromDate} to ${toDate}`);

  // To get all 12 months, we need to make two API calls because Xero API has a limit of 11 periods

  const janFromDate = `${year}-01-01`;
  const janToDate = `${year}-01-31`;

  const febFromDate = `${year}-02-01`;
  const lastDayOfFeb = getLastDayOfFebruary(year);
  const febToDate = `${year}-02-${lastDayOfFeb}`;
  
  // First call: Get data for first 11 months (Mar to Jan)
  const januaryEndDate = `${year}-01-31`;
  const firstElevenMonthsData = await getProfitAndLossWithParams(
    businessId,
    "monthly-breakdown",
    {
      fromDate: janFromDate,
      toDate: janToDate,
      periods: 10,//10
      timeframe: "MONTH",
      standardLayout: true,
      paymentsOnly: false
    }
  ) as MonthlyProfitAndLoss;

  console.log("firstElevenMonthsData", firstElevenMonthsData);

  const deepCopyFirstElevenMonthsData = JSON.parse(JSON.stringify(firstElevenMonthsData));
  console.log('deepCopyFirstElevenMonthsData', deepCopyFirstElevenMonthsData);

  // Second call: Get data for February (last month of financial year)
  const februaryStartDate = `${year}-02-01`;
  const februaryData = await getProfitAndLossWithParams(
    businessId,
    "monthly-breakdown",
    {
      fromDate: febFromDate,
      toDate: febToDate,
      periods: 0,
      timeframe: "MONTH",
      standardLayout: true,
      paymentsOnly: false
    }
  ) as MonthlyProfitAndLoss;
  //const februaryData = {};
  console.log('februaryData', februaryData);

  const deepCopyfebruaryData = JSON.parse(JSON.stringify(februaryData));
  console.log('deepCopyfebruaryData', deepCopyfebruaryData);

  const firstElevenRowHeadings = [];

  const firstElevenSections = firstElevenMonthsData.Reports[0].Rows.filter(x => x.RowType === 'Section' && x.Title !== '');
  console.log('firstElevenSections', firstElevenSections);
  firstElevenSections.forEach((section) => {
    const sectionRows = section.Rows;
    sectionRows.forEach((sectionRow) => {
      const rowHeading = sectionRow.Cells[0].Value;
      firstElevenRowHeadings.push(rowHeading);
    });
  });
  console.log('firstElevenRowHeadings', firstElevenRowHeadings);

  const febRowHeadings = [];

  const febSections = februaryData.Reports[0].Rows.filter(x => x.RowType === 'Section' && x.Title !== '');
  console.log('firstElevenSections', firstElevenSections);
  febSections.forEach((section) => {
    const sectionRows = section.Rows;
    sectionRows.forEach((sectionRow) => {
      const rowHeading = sectionRow.Cells[0].Value;
      febRowHeadings.push(rowHeading);
    });
  });
  console.log('febSections', febSections);
  console.log('febRowHeadings', febRowHeadings);

  const distinctRows = [...new Set([...firstElevenRowHeadings, ...febRowHeadings])];
  console.log('distinctRows', distinctRows);
  
  const sortedRowHeadings = distinctRows.sort();
  console.log('sortedRowHeadings', sortedRowHeadings);

  const financialYearProfitAndLossModel = buildProfitAndLossReportDataArray(februaryData.Reports[0].Rows, null, sortedRowHeadings);
  console.log('financialYearProfitAndLossModel', financialYearProfitAndLossModel);

  const financialYearProfitAndLossModel2 = buildProfitAndLossReportDataArray(firstElevenMonthsData.Reports[0].Rows, financialYearProfitAndLossModel, sortedRowHeadings);
  console.log('financialYearProfitAndLossModel2', financialYearProfitAndLossModel2);

  const febRows = februaryData.Reports[0].Rows;
  const otherRows = firstElevenMonthsData.Reports[0].Rows;
  console.log('TEST TEST febRows', febRows);
  console.log('TEST TESTotherRows', otherRows);

  try {
    console.log("try");
    const financialYearProfitAndLossModelRealTest = buildFinancialYearProfitAndLossModel(sortedRowHeadings, februaryData.Reports[0].Rows, firstElevenMonthsData.Reports[0].Rows);
    console.log('financialYearProfitAndLossModelRealTest', financialYearProfitAndLossModelRealTest);
  }
  catch (err){
    console.log('err', err);
  }

  const financialYearProfitAndLossModelReal = buildFinancialYearProfitAndLossModel(sortedRowHeadings, februaryData.Reports[0].Rows, firstElevenMonthsData.Reports[0].Rows);
  console.log('TEST TEST TEST TEST TEST TEST TEST TEST');
  console.log('financialYearProfitAndLossModel2', financialYearProfitAndLossModel2);
  console.log('financialYearProfitAndLossModelReal', financialYearProfitAndLossModelReal);

  populatModelWithValues(financialYearProfitAndLossModelReal, februaryData.Reports[0].Rows, firstElevenMonthsData.Reports[0].Rows, sortedRowHeadings)

  return financialYearProfitAndLossModelReal;

  // const financialYearProfitAndLossModel2 = buildProfitAndLossReportDataArray(februaryData.Reports[0].Rows);
  // console.log('financialYearProfitAndLossModel2', financialYearProfitAndLossModel2);

  // TODO - ordering of rows
  // TODO - Directors - done
  // TODO - Activity / Interactions - done
  // TODO - CLient fields, custom fields - done
  // TODO - 2026 - handle fields that don't exist at all in feb 
  
  // If either call fails or has no data, return the data we have
  //return firstElevenMonthsData;
}

const populatModelWithValues = (financialYearProfitAndLossModel: FinancialYearProfitAndLossModel, febRows: ProfitAndLossRow[], otherRows: ProfitAndLossRow[], sortedRowHeadings: string[]) => {
  console.log('populatModelWithValues financialYearProfitAndLossModel', financialYearProfitAndLossModel);
  const dataRowObjects = extractAllDataRowObjects(financialYearProfitAndLossModel);
  console.log('populatModelWithValues dataRowObjects', dataRowObjects);

  const combinedRows = [ ...febRows, ...otherRows];
  console.log('populatModelWithValues combinedRows', combinedRows);

  const febValueRows = extractAllDataRowObjectsFromProfitAndLossRowArray(febRows);
  const otherValueRows = extractAllDataRowObjectsFromProfitAndLossRowArray(otherRows);
  const allValueRows = [...febValueRows, ...otherValueRows];
  console.log('populatModelWithValues allValueRows', allValueRows);

  dataRowObjects.forEach(dataRowObject => {

    //const rows = allValueRows.filter(x => x.Cells[0].Value === dataRowObject.rowTitle);
    const febProfitAndLossRow = febValueRows.find(x => x.Cells[0].Value === dataRowObject.rowTitle);
    const otherProfitAndLossRow = otherValueRows.find(x => x.Cells[0].Value === dataRowObject.rowTitle);
    console.log('febProfitAndLossRow', febProfitAndLossRow);
    console.log('otherProfitAndLossRow', otherProfitAndLossRow);
    
    for (let k = 0; k < 12; k++) {
      if (k === 0){
        if (febProfitAndLossRow !== undefined) {
          dataRowObject.rowData[k] = febProfitAndLossRow.Cells[k + 1].Value === "0.00" ? "-" : febProfitAndLossRow.Cells[k + 1].Value;
        }
        else {
          dataRowObject.rowData[k] = "-";
        }
      }
      else {
        if (otherProfitAndLossRow !== undefined) {
          dataRowObject.rowData[k] = otherProfitAndLossRow.Cells[k].Value === "0.00" ? "-" : otherProfitAndLossRow.Cells[k].Value;
        }
        else {
          dataRowObject.rowData[k] = "-";
        }
      }      
    }
  });

  const febGrossProfitSection = febRows.find(x => isGrossProfitSection(x)); 
  const febNetProfitSection = febRows.find(x => isNetProfitSection(x)); 
  console.log('populatModelWithValues febGrossProfitSection', febGrossProfitSection);
  console.log('populatModelWithValues febNetProfitSection', febNetProfitSection);

  financialYearProfitAndLossModel.grossProfitDataRow[0] = febGrossProfitSection.Rows[0].Cells[1].Value === "0.00" ? "-" : febGrossProfitSection.Rows[0].Cells[1].Value;
  financialYearProfitAndLossModel.netProfitDataRow[0] = febNetProfitSection.Rows[0].Cells[1].Value === "0.00" ? "-" : febNetProfitSection.Rows[0].Cells[1].Value;

  const otherGrossProfitSection = otherRows.find(x => isGrossProfitSection(x)); 
  const otherNetProfitSection = otherRows.find(x => isNetProfitSection(x)); 
  console.log('populatModelWithValues otherGrossProfitSection', otherGrossProfitSection);
  console.log('populatModelWithValues otherNetProfitSection', otherNetProfitSection);

  for (let k = 1; k < 12; k++) {
    financialYearProfitAndLossModel.grossProfitDataRow[k] = otherGrossProfitSection.Rows[0].Cells[k].Value === "0.00" ? "-" : otherGrossProfitSection.Rows[0].Cells[k].Value;
    financialYearProfitAndLossModel.netProfitDataRow[k] = otherNetProfitSection.Rows[0].Cells[k].Value === "0.00" ? "-" : otherNetProfitSection.Rows[0].Cells[k].Value;
  }

  console.log('populatModelWithValues financialYearProfitAndLossModel', financialYearProfitAndLossModel);

  return financialYearProfitAndLossModel;
}

const extractAllDataRowObjects =(model: FinancialYearProfitAndLossModel): DataRowObject[] => {
  const fromGross = model.grossProfitSections.flatMap(section => section.dataRowObjects);
  const fromNet = model.netProfitSections.flatMap(section => section.dataRowObjects);

  return [...fromGross, ...fromNet];
}

const extractAllDataRowObjectsFromProfitAndLossRowArray =(models: ProfitAndLossRow[]): ProfitAndLossRow[]=> {
  const rows: ProfitAndLossRow[] = [];
  models.forEach(model => {
    if (model.RowType === 'Section' && model.Title) {
      rows.push(...model.Rows)
    } 
  })

  return rows;
}

export interface ProfitSectionModelTest {
  title: string,
  dataRowObjects: DataRowObject[]
}

export interface DataRowObjectTest {
  rowType: `Row` | `SummaryRow`,
  rowTitle: string,
  rowData: string[]
}

const buildFinancialYearProfitAndLossModel = (headings: string[], febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {
  const financialYearProfitAndLossModel: FinancialYearProfitAndLossModel = {
    headings: [],
    grossProfitSections: [],
    grossProfitDataRow: [],
    netProfitSections: [],
    netProfitDataRow: [],
  };

  console.log('headings', headings);
  console.log('febDataRows', febDataRows);
  console.log('firstElevenMonthsRows', firstElevenMonthsRows);

  // months
  const monthHeaders = getMonthHeaders(febDataRows, firstElevenMonthsRows);
  console.log('monthHeaders', monthHeaders);
  financialYearProfitAndLossModel.headings = monthHeaders;

  const grossProfitSectionHeadings = getGrossProfitSectionHeadings(febDataRows, firstElevenMonthsRows);
  console.log('grossProfitSectionHeadings', grossProfitSectionHeadings);

  const netProfitSectionHeadings = getNetProfitSectionHeadings(febDataRows, firstElevenMonthsRows);
  console.log('netProfitSectionHeadings', netProfitSectionHeadings);

  const grossProfitSectionModels = buildProfitSectionModel(grossProfitSectionHeadings, febDataRows, firstElevenMonthsRows);
  const netProfitSectionModels = buildProfitSectionModel(netProfitSectionHeadings, febDataRows, firstElevenMonthsRows);

  console.log('grossProfitSectionModels', grossProfitSectionModels);
  console.log('netProfitSectionModels', netProfitSectionModels);

  financialYearProfitAndLossModel.grossProfitSections = grossProfitSectionModels;
  financialYearProfitAndLossModel.netProfitSections = netProfitSectionModels;

  // gross net profit totals
  // const febGrossProfitDataRow = febDataRows.find(x => isGrossProfitSection(x));
  // const grossProfitTitle = febGrossProfitDataRow.Rows[0].Cells[0].Value;
  // const febNetProfitDataRow = febDataRows.find(x => isNetProfitSection(x));
  // const netProfitTitle = febNetProfitDataRow.Rows[0].Cells[0].Value;
  // financialYearProfitAndLossModel.grossProfitDataRow.push(grossProfitTitle);
  // financialYearProfitAndLossModel.netProfitDataRow.push(netProfitTitle);
  for (let k = 0; k < 12; k++){
    financialYearProfitAndLossModel.grossProfitDataRow.push("-");
  }
  for (let k = 0; k < 12; k++){
    financialYearProfitAndLossModel.netProfitDataRow.push("-");
  }

  console.log('financialYearProfitAndLossModel', financialYearProfitAndLossModel);

  return financialYearProfitAndLossModel;
}

const buildProfitSectionModel = (sectionHeadings: string[], febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {
  const profitSectionModels: ProfitSectionModel[] = [];

  sectionHeadings.forEach((sectionHeading) => {
    const profitSectionModel: ProfitSectionModel = {
      title: sectionHeading,
      dataRowObjects: []
    };

    const febSection = febDataRows.find(x => x.RowType === "Section" && x.Title === sectionHeading);
    const otherSection = firstElevenMonthsRows.find(x => x.RowType === "Section" && x.Title === sectionHeading);

    console.log('febSection', febSection);
    console.log('otherSection', otherSection);


    const febRows = febSection !== undefined ? febSection.Rows?.filter(x => x.RowType === "Row") : [];
    const otherRows = otherSection !== undefined ? otherSection.Rows?.filter(x => x.RowType === "Row") : [];

    
    console.log('febRows', febRows);
    console.log('otherRows', otherRows);


    const febTitles = [];
    const otherTitles = [];

    for (let k = 0; k < febRows.length; k++) {
      const rowCells = febRows[k].Cells;
      const title = rowCells[0].Value;
      febTitles.push(title);
    }

    for (let k = 0; k < otherRows.length; k++) {
      const rowCells = otherRows[k].Cells;
      const title = rowCells[0].Value;
      otherTitles.push(title);
    }

    console.log('febTitles', febTitles);
    console.log('otherTitles', otherTitles);

    const distinctRows = [...new Set([...febTitles, ...otherTitles])];
    const orderedDistinctRows = distinctRows.sort();
    console.log('orderedDistinctRows', orderedDistinctRows);
    orderedDistinctRows.forEach((row) => {
      const dataRowObject: DataRowObject = {
        rowType: "Row",
        rowTitle: row,
        rowData: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
      }

      profitSectionModel.dataRowObjects.push(dataRowObject);
    });

    const febSummaryRow = febSection !== undefined ? febSection.Rows.find(x => x.RowType === "SummaryRow") : undefined;
    const otherSummaryRow = otherSection !== undefined ? otherSection.Rows.find(x => x.RowType === "SummaryRow") : undefined;

    console.log('febSummaryRow', febSummaryRow);
    console.log('otherSummaryRow', otherSummaryRow);

    if (febSummaryRow !== undefined) {
      const cells = febSummaryRow.Cells;
      const dataRowObject: DataRowObject = {
        rowType: "SummaryRow",
        rowTitle: cells[0].Value,
        rowData: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
      };
      profitSectionModel.dataRowObjects.push(dataRowObject);
    }
    else {
      const cells = otherSummaryRow.Cells;
      const dataRowObject: DataRowObject = {
        rowType: "SummaryRow",
        rowTitle: cells[0].Value,
        rowData: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
      };
      profitSectionModel.dataRowObjects.push(dataRowObject);
    }

    profitSectionModels.push(profitSectionModel);
  });

  return profitSectionModels;
}

const getMonthHeaders = (febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {
  const febHeaderRow = febDataRows.find(x => x.RowType === "Header");
  const firstElevenMonthsHeaderRow = firstElevenMonthsRows.find(x => x.RowType === "Header");

  console.log('febHeaderRow', febHeaderRow);
  console.log('firstElevenMonthsHeaderRow', firstElevenMonthsHeaderRow);

  const headings = [];
  const febHeader = febHeaderRow.Cells[1].Value;
  headings.push(febHeader);

  console.log('firstElevenMonthsHeaderRow.Cells', firstElevenMonthsHeaderRow.Cells);
  for (let k = 1; k < firstElevenMonthsHeaderRow.Cells.length; k++) {
    const monthHeader = firstElevenMonthsHeaderRow.Cells[k].Value;
    headings.push(monthHeader);
  }

  return headings;
}

const getGrossProfitSectionHeadings = (febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {
  const febTitles = [];
  const otherTitles = [];

  for (let k = 0; k < febDataRows.length; k++){
    const row = febDataRows[k];

    if (isHeaderRow(row)) {
      continue;
    }

    if (isGrossProfitSection(row)) {
      break;
    }

    if (isSectionRow(row)) {
      febTitles.push(row.Title);
    }
  }

  for (let k = 0; k < firstElevenMonthsRows.length; k++){
    const row = firstElevenMonthsRows[k];

    if (isHeaderRow(row)) {
      continue;
    }

    if (isGrossProfitSection(row)) {
      break;
    }

    if (isSectionRow(row)) {
      otherTitles.push(row.Title);
    }
  }

  const distinctRows = [...new Set([...febTitles, ...otherTitles])];
  return distinctRows;
}

const getNetProfitSectionHeadings = (febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {
  const febTitles = [];
  const otherTitles = [];

  let nextSectionIsNetProfitSectionForGross = false;
  for (let k = 0; k < febDataRows.length; k++){
    const row = febDataRows[k];

    if (isHeaderRow(row)) {
      continue;
    }

    if (isNetProfitSection(row)) {
      break;
    }

    if (isGrossProfitSection(row)) {
      nextSectionIsNetProfitSectionForGross = true;
      continue;
    }

    if (nextSectionIsNetProfitSectionForGross === false) {
      continue;
    }

    if (isSectionRow(row)) {
      febTitles.push(row.Title);
    }
  }

  let nextSectionIsNetProfitSectionForNet = false;
  for (let k = 0; k < firstElevenMonthsRows.length; k++){
    const row = firstElevenMonthsRows[k];

    if (isHeaderRow(row)) {
      continue;
    }

    if (isNetProfitSection(row)) {
      break;
    }

    if (isGrossProfitSection(row)) {
      nextSectionIsNetProfitSectionForNet = true;
      continue;
    }

    if (nextSectionIsNetProfitSectionForNet === false) {
      continue;
    }

    if (isSectionRow(row)) {
      otherTitles.push(row.Title);
    }
  }

  const distinctRows = [...new Set([...febTitles, ...otherTitles])];
  return distinctRows;
}

// const getGrossProfitSectionRowHeadings = (febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {
//   const grossProfitSectionRowHeadings = [];


// }

// const getGrossProfitSectionRowHeadings = (febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {

// }

// const getGrossProfitSectionRowHeadings = (febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {

// }

// const getGrossProfitSectionRowHeadings = (febDataRows: ProfitAndLossRow[], firstElevenMonthsRows: ProfitAndLossRow[]) => {

// }

const isHeaderRow = (rowObject: ProfitAndLossRow) => {
  return rowObject.RowType === `Header`;
}

const isSectionRow = (rowObject: ProfitAndLossRow) => {
  return rowObject.RowType === `Section` && rowObject.Title;
}

const isGrossProfitSection = (rowObject: ProfitAndLossRow) => {
  return rowObject.RowType === `Section` && rowObject.Title === `` && rowObject.Rows[0].RowType === `Row` && rowObject.Rows[0].Cells[0].Value === `Gross Profit`;
}

const isNetProfitSection = (rowObject: ProfitAndLossRow) => {
  return rowObject.RowType === `Section` && rowObject.Title === `` && rowObject.Rows[0].RowType === `Row` && rowObject.Rows[0].Cells[0].Value === `Net Profit`;
}

/**
 * Helper function to recursively combine rows from two reports
 * @param mainRows Rows from the main report (first 11 months)
 * @param februaryRows Rows from the February report
 */
// function combineReportRows(mainRows: ProfitAndLossRow[], februaryRows: ProfitAndLossRow[]) {
//   // Process each row recursively
//   for (let i = 0; i < mainRows.length; i++) {
//     const mainRow = mainRows[i];
//     const febRow = februaryRows[i];
    
//     if (!febRow) continue;
    
//     // If the row has cells, add February data
//     if (mainRow.Cells && febRow.Cells && febRow.Cells.length > 0) {
//       // For header rows that have column titles
//       if (mainRow.RowType === "Header") {
//         mainRow.Cells.push(febRow.Cells[1]); // Add February column header
//       } 
//       // For data and summary rows
//       else if (mainRow.Cells.length > 0 && febRow.Cells.length > 0) {
//         mainRow.Cells.push(febRow.Cells[1]); // Add February value
//       }
//     }
    
//     // Recursively process nested rows
//     if (mainRow.Rows && febRow.Rows) {
//       combineReportRows(mainRow.Rows, febRow.Rows);
//     }
//   }
// }

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
