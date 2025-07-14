
import { supabase } from "@/integrations/supabase/client";
import { DbClientBusiness } from "@/types/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  client_business_id: string;
  created_at: string;
  updated_at: string | null;
  status: string;
  task_type: string;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_by: string | null;
}

export const fetchClientTasks = async (businessId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_business_id', businessId);

  if (error) throw error;
  return data || [];
};