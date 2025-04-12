import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClientBusiness } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Users, ClipboardList, RefreshCw, LinkIcon } from "lucide-react";
import ClientDetailUsers from "@/components/ClientDetailUsers";
import TasksManagement from "@/components/TasksManagement";
import { XeroConnectionSelector } from "@/components/XeroConnectionSelector";

function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: client, isLoading, isError, refetch } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_businesses")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        contactName: data.contact_name,
        email: data.email,
        phone: data.phone || "",
        industry: data.industry || "",
        tenantId: data.tenant_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by
      } as ClientBusiness;
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activePath={location.pathname} />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activePath={location.pathname} />
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Error loading client</h1>
            <p className="text-slate-500 mt-2">Could not load client information.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/clients")} 
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
      <AdminSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/admin/clients")} 
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
                <p className="text-slate-500">Client Business Details</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">
                <Building className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ClipboardList className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Details about the client business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Business Name</h3>
                      <p className="text-slate-800">{client.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Industry</h3>
                      <p className="text-slate-800">{client.industry || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Contact Person</h3>
                      <p className="text-slate-800">{client.contactName}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Email</h3>
                      <p className="text-slate-800">{client.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Phone</h3>
                      <p className="text-slate-800">{client.phone || "Not provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Created</h3>
                      <p className="text-slate-800">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LinkIcon className="mr-2 h-5 w-5 text-blue-500" />
                    Xero Integration
                  </CardTitle>
                  <CardDescription>
                    Manage Xero connection for this client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <XeroConnectionSelector 
                    clientBusiness={client} 
                    onUpdate={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users">
              <ClientDetailUsers clientId={client.id} clientName={client.name} />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TasksManagement clientId={client.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;
