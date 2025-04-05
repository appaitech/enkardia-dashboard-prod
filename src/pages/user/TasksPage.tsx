
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChartBig, 
  Calendar, 
  FileText, 
  ListChecks,
  Loader2,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import UserSidebar from "@/components/UserSidebar";

// Define Task type based on our database schema
interface Task {
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

const fetchClientTasks = async (businessId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_business_id', businessId);

  if (error) throw error;
  return data || [];
};

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch the user's associated business
  const { data: businessData } = useQuery({
    queryKey: ['user_client_businesses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_client_businesses')
        .select('client_business_id')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: tasks, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', businessData?.client_business_id],
    queryFn: () => fetchClientTasks(businessData?.client_business_id),
    enabled: !!businessData?.client_business_id
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'outline';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/tasks" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/tasks" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
            <p className="mt-2 text-slate-500">There was a problem loading your tasks</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <UserSidebar activePath="/user/tasks" />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ListChecks className="h-8 w-8 text-green-600" />
            My Tasks
          </h1>
        </div>

        {tasks && tasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.start_date 
                      ? format(new Date(task.start_date), 'MMM dd, yyyy') 
                      : 'Not set'}
                  </TableCell>
                  <TableCell>
                    {task.due_date 
                      ? format(new Date(task.due_date), 'MMM dd, yyyy') 
                      : 'Not set'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No tasks found for this business.
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
