
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientBusiness } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Users, ClipboardList, RefreshCw, LinkIcon, Bell, User, Plus, X, FileText, Edit, Settings } from "lucide-react";
import ClientDetailUsers from "@/components/ClientDetailUsers";
import TasksManagement from "@/components/TasksManagement";
import { XeroConnectionSelector } from "@/components/XeroConnectionSelector";
import { CallToActionTab } from "@/components/CallToAction/CallToActionTab";
import { getClientDirectors, getNonAssociatedDirectors, associateDirectorWithClient, removeDirectorFromClient } from "@/services/directorService";
import { Director } from "@/types/director";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientActivities } from "@/components/ClientActivities";
import EditClientForm from "@/components/EditClientForm";
import { CustomFieldsManager } from "@/components/CustomFieldsManager";
import { updateClientBusiness } from "@/services/clientService";
import { getClientFieldValues } from "@/services/customFieldService";
import { CustomField } from "@/types/customField";

function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [directorId, setDirectorId] = useState<string>("");
  const [isEditingClient, setIsEditingClient] = useState(false);

  // Load client details
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

  // Load custom fields for this client
  const { 
    data: customFields, 
    isLoading: isLoadingCustomFields 
  } = useQuery({
    queryKey: ["client-custom-fields-overview", id],
    queryFn: () => getClientFieldValues(id!),
    enabled: !!id && activeTab === "overview",
  });

  // Load directors
  const { data: directors, isLoading: isLoadingDirectors } = useQuery({
    queryKey: ["client-directors", id],
    queryFn: () => getClientDirectors(id!),
    enabled: !!id,
  });

  const { data: availableDirectors, isLoading: isLoadingAvailableDirectors } = useQuery({
    queryKey: ["non-associated-directors", id],
    queryFn: () => getNonAssociatedDirectors(id!),
    enabled: !!id,
  });

  const addDirectorMutation = useMutation({
    mutationFn: () => associateDirectorWithClient(directorId, id!),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Director associated with client successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["client-directors", id] });
      queryClient.invalidateQueries({ queryKey: ["non-associated-directors", id] });
      setDirectorId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to associate director: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const removeDirectorMutation = useMutation({
    mutationFn: (directorId: string) => removeDirectorFromClient(directorId, id!),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Director removed from client successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["client-directors", id] });
      queryClient.invalidateQueries({ queryKey: ["non-associated-directors", id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove director: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: (updates: Partial<ClientBusiness>) => updateClientBusiness(id!, updates),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["client-custom-fields-overview", id] });
      setIsEditingClient(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["client-custom-fields-overview", id] });
  };

  const handleAddDirector = () => {
    if (directorId) {
      addDirectorMutation.mutate();
    }
  };

  const handleRemoveDirector = (directorId: string) => {
    removeDirectorMutation.mutate(directorId);
  };

  const navigateToDirector = (directorId: string) => {
    navigate(`/admin/directors/${directorId}`);
  };

  const handleUpdateClient = async (updates: Partial<ClientBusiness>) => {
    updateClientMutation.mutate(updates);
  };

  // Format custom field value for display
  const formatFieldValue = (field: CustomField) => {
    if (field.value === null) return "Not set";
    
    switch (field.definition.field_type) {
      case 'boolean':
        return field.value === 'true' ? 'Yes' : 'No';
      case 'date':
        try {
          return new Date(field.value).toLocaleDateString();
        } catch {
          return field.value;
        }
      default:
        return field.value;
    }
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
              {/* <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingClient(true)}
              >
                <Edit className="mr-2 h-3.5 w-3.5" />
                Edit Details
              </Button> */}
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
              <TabsTrigger value="directors">
                <User className="h-4 w-4 mr-2" />
                Directors
              </TabsTrigger>
              <TabsTrigger value="call-to-actions">
                <Bell className="h-4 w-4 mr-2" />
                Call To Actions
              </TabsTrigger>
              <TabsTrigger value="activities">
                <FileText className="h-4 w-4 mr-2" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="custom-fields">
                <Settings className="h-4 w-4 mr-2" />
                Custom Fields
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {isEditingClient ? (
                <EditClientForm 
                  client={client}
                  onSubmit={handleUpdateClient}
                  onCancel={() => setIsEditingClient(false)} 
                />
              ) : (
                <>
                  <Card className="mb-6">
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
                  
                  {/* Custom Fields Card */}
                  {customFields && customFields.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Custom Fields</CardTitle>
                        <CardDescription>
                          Additional information about this client
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {customFields.map((field) => (
                            <div key={field.definition.id}>
                              <h3 className="text-sm font-medium text-slate-500 mb-1">
                                {field.definition.name}
                              </h3>
                              <p className="text-slate-800">{formatFieldValue(field)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isLoadingCustomFields && (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                    </div>
                  )}

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
                </>
              )}
            </TabsContent>
            
            <TabsContent value="users">
              <ClientDetailUsers clientId={client.id} clientName={client.name} />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TasksManagement clientId={client.id} />
            </TabsContent>

            <TabsContent value="directors">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Directors</CardTitle>
                    <CardDescription>Associated directors for {client.name}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <Select 
                          value={directorId} 
                          onValueChange={setDirectorId}
                          disabled={!availableDirectors || availableDirectors.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a director" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDirectors && availableDirectors.map((director) => (
                              <SelectItem key={director.id} value={director.id}>
                                {director.full_name}
                              </SelectItem>
                            ))}
                            {(!availableDirectors || availableDirectors.length === 0) && (
                              <SelectItem value="none" disabled>
                                No available directors
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleAddDirector} 
                        disabled={!directorId || addDirectorMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Director
                      </Button>
                    </div>

                    {isLoadingDirectors ? (
                      <div className="flex justify-center py-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                      </div>
                    ) : directors && directors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {directors.map((director: Director) => (
                          <Card 
                            key={director.id} 
                            className="bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div 
                                  className="flex items-center flex-grow"
                                  onClick={() => navigateToDirector(director.id)}
                                >
                                  <User className="h-8 w-8 p-1 mr-3 rounded-full bg-primary/10 text-primary" />
                                  <div>
                                    <div className="font-medium">{director.full_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {director.position || "No position specified"}
                                    </div>
                                    {director.email && (
                                      <div className="text-xs text-muted-foreground mt-1">{director.email}</div>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDirector(director.id);
                                  }}
                                  disabled={removeDirectorMutation.isPending}
                                >
                                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No directors are associated with this client.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="call-to-actions">
              <CallToActionTab clientId={client.id} clientName={client.name} />
            </TabsContent>

            <TabsContent value="activities">
              <ClientActivities clientId={client.id} />
            </TabsContent>

            <TabsContent value="custom-fields">
              <CustomFieldsManager clientId={client.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;
