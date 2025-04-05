
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
  Fields: any[];
  Rows: ProfitAndLossRow[];
}

export interface ProfitAndLossResponse {
  Id: string;
  Status: string;
  ProviderName: string;
  DateTimeUTC: string;
  Reports: ProfitAndLossReport[];
}

export async function getProfitAndLossData(businessId: string | null): Promise<ProfitAndLossResponse> {
  if (!businessId) {
    throw new Error('No business ID provided');
  }

  try {
    // Load the P&L data from the client-specific file
    const response = await fetch(`/client_businesses/${businessId}/basicCurrentFinancialYear.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load profit and loss data for business ${businessId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching P&L data:", error);
    throw error;
  }
}
