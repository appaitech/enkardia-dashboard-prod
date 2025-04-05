
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

export async function getProfitAndLossData(): Promise<ProfitAndLossResponse> {
  // In a production app, you would likely fetch this from an API
  // For this example, we're using the static JSON file
  try {
    const response = await fetch('/ProfitAndLossResponse.json');
    if (!response.ok) {
      throw new Error('Failed to load profit and loss data');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching P&L data:", error);
    throw error;
  }
}
