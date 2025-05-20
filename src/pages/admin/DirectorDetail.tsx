
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  getDirector, 
  getAssociatedClients, 
  associateDirectorWithClient, 
  removeDirectorFromClient 
} from "@/services/directorService";
import { getClientBusinesses } from "@/services/clientService";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X, 
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientBusiness } from "@/types/client";

const DirectorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState<string>("");

  const { data: director, isLoading, error } = useQuery({
    queryKey: ["director", id],
    queryFn: () => getDirector(id!),
    enabled: !!id,
  });

  const { data: associatedClients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["director-clients", id],
    queryFn: () => getAssociatedClients(id!),
    enabled: !!id,
  });

  const { data: allClients, isLoading: isLoadingAllClients } = useQuery({
    queryKey: ["all-clients"],
    queryFn: () => getClientBusinesses(),
  });

  const associateClientMutation = useMutation({
    mutationFn: () => associateDirectorWithClient(id!, clientId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client associated with director successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["director-clients", id] });
      setClientId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to associate client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const removeClientMutation = useMutation({
    mutationFn: (clientId: string) => removeDirectorFromClient(id!, clientId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client removed from director successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["director-clients", id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter out already associated clients
  const availableClients = allClients?.filter(
    (client) => 
      !associatedClients?.some(
        (associatedClient) => associatedClient.id === client.id
      )
  ) || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !director) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Error loading director details</h3>
                <p className="text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : "Director not found"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/admin/directors")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Directors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy");
    } catch (e) {
      return date;
    }
  };

  const handleAddClient = () => {
    if (clientId) {
      associateClientMutation.mutate();
    }
  };

  const handleRemoveClient = (clientId: string) => {
    removeClientMutation.mutate(clientId);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/admin/directors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directors
          </Button>
          <Button onClick={() => navigate(`/admin/directors/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Director
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{director.full_name}</CardTitle>
            <div className="text-muted-foreground">{director.position || "No position specified"}</div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Personal Information</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div className="font-medium">{director.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">{formatDate(director.date_of_birth)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Nationality</div>
                    <div className="font-medium">{director.nationality || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Identification/Passport Number</div>
                    <div className="font-medium">{director.identification_number || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Residential Address</div>
                    <div className="font-medium">{director.residential_address || "-"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Contact Details</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Email Address</div>
                    <div className="font-medium">{director.email || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone Number</div>
                    <div className="font-medium">{director.phone || "-"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Director Role Information</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Position/Title</div>
                    <div className="font-medium">{director.position || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Appointment</div>
                    <div className="font-medium">{formatDate(director.date_of_appointment)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Resignation</div>
                    <div className="font-medium">{formatDate(director.date_of_resignation)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Director Type</div>
                    <div className="font-medium">{director.director_type || "-"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Compliance & Legal</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Tax Number</div>
                    <div className="font-medium">{director.tax_number || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tax Identification Number (TIN)</div>
                    <div className="font-medium">{director.tax_identification_number || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Residency Status</div>
                    <div className="font-medium">{director.residency_status || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-medium mb-4">Associated Clients</h3>
                <Separator className="mb-4" />
                
                <div className="space-y-4">
                  {/* Add client form */}
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <Select 
                        value={clientId} 
                        onValueChange={setClientId}
                        disabled={availableClients.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                          {availableClients.length === 0 && (
                            <SelectItem value="none" disabled>
                              No available clients
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddClient} 
                      disabled={!clientId || associateClientMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>

                  {/* Client listing */}
                  {isLoadingClients ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : associatedClients && associatedClients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {associatedClients.map((client) => (
                        <Card key={client.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{client.name}</div>
                                  <div className="text-xs text-muted-foreground">{client.email}</div>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveClient(client.id)}
                                disabled={removeClientMutation.isPending}
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      This director is not associated with any clients yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DirectorDetail;
