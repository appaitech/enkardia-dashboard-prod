
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
  ListChecks 
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const fetchClientTasks = async (businessId: string) => {
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

  const { data: tasks, isLoading } = useQuery({
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

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-green-600" />
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
  );
};

export default TasksPage;
