import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SarsRequestTimer from '@/components/SarsRequestTimer';
import { Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TasksPage = () => {
  // Example SARS requests - in a real app, these would come from your backend
  const sarsRequests = [
    {
      id: 1,
      requestDate: new Date('2024-03-01'),
      status: 'pending' as const,
      documentType: 'Tax Clearance Certificate',
      reference: 'SARS-2024-001',
      title: 'Tax Clearance Application',
      description: 'Application for Tax Clearance Certificate for government tender purposes. Requires verification of tax compliance status.',
      priority: 'high',
      assignee: 'John Smith',
    },
    {
      id: 2,
      requestDate: new Date('2024-02-15'),
      status: 'completed' as const,
      documentType: 'VAT Registration',
      reference: 'SARS-2024-002',
      title: 'VAT Registration Certificate',
      description: 'New business VAT registration application. Registration number and certificate pending SARS verification.',
      priority: 'medium',
      assignee: 'Sarah Johnson',
    },
    {
      id: 3,
      requestDate: new Date('2024-01-20'),
      status: 'overdue' as const,
      documentType: 'Income Tax Return',
      reference: 'SARS-2024-003',
      title: 'Annual Tax Return Submission',
      description: 'Submission of annual company tax return including financial statements and supporting documents.',
      priority: 'urgent',
      assignee: 'Mike Brown',
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasks & Document Requests</h1>
          <p className="text-slate-500 mt-1">Track and manage your SARS document requests and tasks</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            {sarsRequests.filter(r => r.status === 'pending').length} Pending
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {sarsRequests.filter(r => r.status === 'completed').length} Completed
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {sarsRequests.filter(r => r.status === 'overdue').length} Overdue
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {sarsRequests.map((request) => (
            <Card key={request.id} className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-xl">{request.title}</CardTitle>
                    <CardDescription className="mt-1">{request.description}</CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={getPriorityBadge(request.priority)}
                  >
                    {request.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FileText className="h-4 w-4" />
                  <span>Assigned to {request.assignee}</span>
                </div>
              </CardHeader>
              <CardContent>
                <SarsRequestTimer
                  requestDate={request.requestDate}
                  status={request.status}
                  documentType={request.documentType}
                  reference={request.reference}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Add similar TabsContent for other tabs, filtering by status */}
      </Tabs>
    </div>
  );
};

export default TasksPage; 