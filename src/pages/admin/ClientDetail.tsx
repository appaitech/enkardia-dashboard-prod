
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/AdminSidebar";
import ClientDetailUsers from "@/components/ClientDetailUsers";
import TasksManagement from "@/components/TasksManagement";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Building, 
  Loader2, 
  Users, 
  FileUp, 
  ListChecks, 
  CalendarClock,
  XCircle,
  ArrowRight
} from "lucide-react";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: clientBusiness, isLoading, error } = useQuery({
    queryKey: ['client-business', id],
    queryFn: async () => {
      if (!id) throw new Error("No client ID provided");
      
      const { data, error } = await supabase
        .from('client_businesses')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error("Client not found");
      
      return data;
    },
    enabled: !!id && !!user
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activePath="/admin/clients" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading client data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clientBusiness) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activePath="/admin/clients" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Error Loading Client</h2>
            <p className="mt-2 text-slate-500">
              {error instanceof Error ? error.message : "Client not found"}
            </p>
            <Button 
              onClick={() => navigate('/admin/clients')} 
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activePath="/admin/clients" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Back button and header */}
          <div className="flex flex-col space-y-4 mb-8">
            <Button 
              variant="ghost" 
              className="self-start" 
              onClick={() => navigate('/admin/clients')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Building className="h-8 w-8 text-blue-600" />
                  {clientBusiness.name}
                </h1>
                <p className="text-slate-500 mt-1">{clientBusiness.industry || 'No industry specified'}</p>
              </div>
              
              <div className="space-x-2">
                <Button variant="outline">
                  Edit Client
                </Button>
                <Button>
                  Connect to Xero
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <ListChecks className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileUp className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Business Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Business Name</p>
                      <p className="font-medium">{clientBusiness.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Industry</p>
                      <p className="font-medium">{clientBusiness.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{clientBusiness.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium">{clientBusiness.phone || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Contact Person</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Name</p>
                      <p className="font-medium">{clientBusiness.contact_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Xero Connection</p>
                      <p className="font-medium">
                        {clientBusiness.xero_connected ? 
                          'Connected to Xero' : 
                          'Not connected to Xero'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Created At</p>
                      <p className="font-medium">
                        {new Date(clientBusiness.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <ClientDetailUsers clientId={id || ''} />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TasksManagement clientId={id || ''} />
            </TabsContent>
            
            <TabsContent value="documents">
              <div className="bg-white p-8 rounded-lg border shadow-sm text-center">
                <FileUp className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium">Document Management</h3>
                <p className="mt-2 text-slate-500 max-w-md mx-auto">
                  This feature is coming soon. You'll be able to upload and manage documents for this client.
                </p>
                <Button variant="outline" className="mt-4" disabled>
                  Coming Soon
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
