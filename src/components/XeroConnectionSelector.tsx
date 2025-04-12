
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientBusiness } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, XCircle, LinkIcon, RotateCw } from "lucide-react";

interface XeroConnectionSelectorProps {
  clientBusiness: ClientBusiness;
  onUpdate: () => void;
}

interface XeroToken {
  id: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
  token_expiry: string;
}

interface XeroConnection {
  id: string;
  xero_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_type: string;
  xero_token_id: string;
}

export function XeroConnectionSelector({ clientBusiness, onUpdate }: XeroConnectionSelectorProps) {
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all Xero tokens directly from the database
  const { data: tokens, isLoading: isLoadingTokens, refetch: refetchTokens } = useQuery({
    queryKey: ["xero-tokens"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("xero_tokens")
          .select("id, user_name, created_at, updated_at, token_expiry")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        return data as XeroToken[];
      } catch (error) {
        console.error("Error fetching Xero tokens:", error);
        return [];
      }
    },
  });

  // Fetch connections for the selected token directly from the database
  const { data: connections, isLoading: isLoadingConnections, refetch: refetchConnections } = useQuery({
    queryKey: ["xero-connections", selectedTokenId],
    queryFn: async () => {
      if (!selectedTokenId) return [];
      
      try {
        const { data, error } = await supabase
          .from("xero_connections")
          .select("id, xero_id, tenant_id, tenant_name, tenant_type, xero_token_id")
          .eq("xero_token_id", selectedTokenId);
        
        if (error) throw error;
        
        return data as XeroConnection[];
      } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
      }
    },
    enabled: !!selectedTokenId,
  });

  // Fetch assigned connection information
  const { data: assignedConnection, isLoading: isLoadingAssigned, refetch: refetchAssigned } = useQuery({
    queryKey: ["assigned-xero-connection", clientBusiness?.id, clientBusiness?.tenantId],
    queryFn: async () => {
      if (!clientBusiness?.tenantId) return null;
      
      try {
        const { data, error } = await supabase
          .from("xero_connections")
          .select("id, xero_id, tenant_id, tenant_name, tenant_type, xero_token_id")
          .eq("tenant_id", clientBusiness.tenantId)
          .maybeSingle();
          
        if (error) throw error;
        
        return data as XeroConnection | null;
      } catch (error) {
        console.error("Error fetching assigned connection:", error);
        return null;
      }
    },
    enabled: !!clientBusiness?.tenantId,
  });

  // Reset selected connection when token changes
  React.useEffect(() => {
    setSelectedConnectionId("");
  }, [selectedTokenId]);

  // Handle assigning connection to client business
  const handleAssignConnection = async () => {
    if (!selectedConnectionId) {
      toast.error("Please select a Xero connection");
      return;
    }

    setIsAssigning(true);

    try {
      // Get the selected connection
      const selectedConnection = connections?.find(conn => conn.id === selectedConnectionId);
      
      if (!selectedConnection) {
        throw new Error("Selected connection not found");
      }

      // Update client business with tenant_id
      const { error: updateClientError } = await supabase
        .from("client_businesses")
        .update({ 
          tenant_id: selectedConnection.tenant_id,
          updated_at: new Date().toISOString()
        })
        .eq("id", clientBusiness.id);

      if (updateClientError) throw updateClientError;

      toast.success("Xero connection assigned successfully");
      onUpdate();
      refetchAssigned();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error assigning connection:", error);
      toast.error("Failed to assign Xero connection");
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle removing connection from client business
  const handleRemoveConnection = async () => {
    if (!clientBusiness?.tenantId) {
      return;
    }

    setIsAssigning(true);

    try {
      // Update client business to remove tenant_id
      const { error: updateError } = await supabase
        .from("client_businesses")
        .update({ 
          tenant_id: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", clientBusiness.id);

      if (updateError) throw updateError;

      toast.success("Xero connection removed successfully");
      onUpdate();
      refetchAssigned();
    } catch (error) {
      console.error("Error removing connection:", error);
      toast.error("Failed to remove Xero connection");
    } finally {
      setIsAssigning(false);
    }
  };

  // Refresh data
  const handleRefreshData = () => {
    refetchTokens();
    refetchConnections();
    refetchAssigned();
  };

  if (isLoadingAssigned) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
        <span className="text-sm text-slate-500">Checking Xero connection...</span>
      </div>
    );
  }

  // If a connection is already assigned
  if (assignedConnection) {
    return (
      <div className="rounded-md border p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">Connected to Xero</h4>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              This client is connected to Xero tenant: <span className="font-medium">{assignedConnection.tenant_name}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRemoveConnection} disabled={isAssigning}>
            {isAssigning ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
            ) : (
              "Remove Connection"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // If no connection is assigned
  return (
    <div className="rounded-md border p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium">Not connected to Xero</h4>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            This client doesn't have a Xero connection assigned.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <LinkIcon className="mr-2 h-4 w-4" />
              Assign Xero Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Xero Connection</DialogTitle>
              <DialogDescription>
                Select a Xero token and connection to assign to this client.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="xero-token" className="text-sm font-medium">
                  Xero Token
                </label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedTokenId} 
                    onValueChange={setSelectedTokenId}
                  >
                    <SelectTrigger id="xero-token" className="w-full">
                      <SelectValue placeholder="Select a Xero token" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTokens ? (
                        <div className="flex items-center justify-center p-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                        </div>
                      ) : tokens && tokens.length > 0 ? (
                        tokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            {token.user_name || `Xero User (${token.id.substring(0, 6)}...)`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-slate-500">
                          No Xero tokens available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleRefreshData}
                    title="Refresh data"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {selectedTokenId && (
                <div className="grid gap-2">
                  <label htmlFor="xero-connection" className="text-sm font-medium">
                    Xero Connection
                  </label>
                  <Select 
                    value={selectedConnectionId} 
                    onValueChange={setSelectedConnectionId}
                    disabled={!selectedTokenId || isLoadingConnections}
                  >
                    <SelectTrigger id="xero-connection" className="w-full">
                      <SelectValue placeholder="Select a Xero connection" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingConnections ? (
                        <div className="flex items-center justify-center p-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                        </div>
                      ) : connections && connections.length > 0 ? (
                        connections.map((connection) => (
                          <SelectItem key={connection.id} value={connection.id}>
                            {connection.tenant_name} ({connection.tenant_type})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-slate-500">
                          No connections available for this token
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleAssignConnection} 
                disabled={!selectedConnectionId || isAssigning}
              >
                {isAssigning ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                ) : (
                  <LinkIcon className="mr-2 h-4 w-4" />
                )}
                Assign Connection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
