
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
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
  RefreshCcw,
  UserCircle
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import UserSidebar from "@/components/UserSidebar";
import { getUserClientBusinesses, getSelectedClientBusinessId, saveSelectedClientBusinessId } from "@/services/userService";
import ClientBusinessSelector from "@/components/ClientBusinessSelector";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const location = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(getSelectedClientBusinessId());
  const isMobile = useIsMobile();
  
  const { 
    data: clientBusinesses,
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses,
    refetch: refetchBusinesses
  } = useQuery({
    queryKey: ["user-client-businesses", user?.id],
    queryFn: () => getUserClientBusinesses(user?.id || ""),
    enabled: !!user?.id,
  });

  const { 
    data: tasks, 
    isLoading: isLoadingTasks, 
    isError: isErrorTasks, 
    refetch: refetchTasks 
  } = useQuery({
    queryKey: ['tasks', selectedBusinessId],
    queryFn: () => fetchClientTasks(selectedBusinessId || ''),
    enabled: !!selectedBusinessId
  });

  useEffect(() => {
    if (clientBusinesses?.length && !selectedBusinessId) {
      const validBusinesses = clientBusinesses.filter(business => business !== null);
      if (validBusinesses.length > 0) {
        const firstBusinessId = validBusinesses[0].id;
        setSelectedBusinessId(firstBusinessId);
        saveSelectedClientBusinessId(firstBusinessId);
      }
    }
  }, [clientBusinesses, selectedBusinessId]);

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    saveSelectedClientBusinessId(businessId);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'outline';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoadingBusinesses) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar activePath={location.pathname} />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center pt-14 lg:pl-64 lg:pt-0">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading your client businesses...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isErrorBusinesses) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar activePath={location.pathname} />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center pt-14 lg:pl-64 lg:pt-0">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
            <p className="mt-2 text-slate-500">There was a problem loading your client businesses</p>
            <Button onClick={() => refetchBusinesses()} className="mt-4">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validBusinesses = clientBusinesses?.filter(business => business !== null) || [];
  
  if (validBusinesses.length === 0) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar activePath={location.pathname} />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center pt-14 lg:pl-64 lg:pt-0">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">No Client Businesses</h2>
            <p className="mt-2 text-slate-500">You don't have access to any client businesses yet</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedBusiness = selectedBusinessId 
    ? validBusinesses.find(b => b && b.id === selectedBusinessId) 
    : validBusinesses[0];
  
  if (!selectedBusiness) {
    const firstBusinessId = validBusinesses[0].id;
    setSelectedBusinessId(firstBusinessId);
    saveSelectedClientBusinessId(firstBusinessId);
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar activePath={location.pathname} />
      <div className="flex-1 w-full pt-14 lg:pl-64 lg:pt-0">
        <div className="p-4 md:p-8">
          <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="flex items-center space-x-3">
                <ListChecks className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Task Statuses</h1>
              </div>
              <p className="text-slate-500 mt-2">
                We are working on your tasks. Here you can see their statuses.
              </p>
            </div>
            
            {validBusinesses.length > 0 && (
              <div className="w-full md:w-auto">
                <ClientBusinessSelector 
                  clientBusinesses={validBusinesses}
                  selectedBusinessId={selectedBusinessId}
                  onBusinessSelect={handleBusinessSelect}
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800">{selectedBusiness.name}</h2>
            <div className="flex items-center mt-1 text-sm text-slate-500">
              <span>{selectedBusiness.industry || "No industry specified"}</span>
            </div>
          </div>

          {isLoadingTasks ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-4 text-slate-500">Loading tasks...</p>
              </div>
            </div>
          ) : isErrorTasks ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Error Loading Tasks</h2>
              <p className="mt-2 text-slate-500">There was a problem loading your tasks</p>
              <Button onClick={() => refetchTasks()} className="mt-4">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="bg-white p-4 md:p-6 rounded-lg border shadow-sm overflow-x-auto">
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Start Date</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{task.description}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
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
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-muted-foreground">No tasks found for this business.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
