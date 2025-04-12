
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { XeroToken, XeroConnection } from "@/types/xero";
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

export function XeroConnectionSelector({ clientBusiness, onUpdate }: XeroConnectionSelectorProps) {
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all Xero tokens
  const { data: tokens, isLoading: isLoadingTokens, refetch: refetchTokens } = useQuery({
    queryKey: ["xero-tokens"],
    queryFn: async () => {
      try {
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/xero-auth?action=get-tokens`, {
          headers: {
            Authorization: `Bearer ${supabase.supabaseKey}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch Xero tokens");
        }
        
        const data = await response.json();
        return data.tokens as XeroToken[];
      } catch (error) {
        console.error("Error fetching Xero tokens:", error);
        return [];
      }
    },
  });

  // Fetch connections for the selected token
  const { data: connections, isLoading: isLoadingConnections, refetch: refetchConnections } = useQuery({
    queryKey: ["xero-connections", selectedTokenId],
    queryFn: async () => {
      if (!selectedTokenId) return [];
      
      try {
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/xero-auth?action=get-connections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabase.supabaseKey}`,
          },
          body: JSON.stringify({ tokenId: selectedTokenId }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch Xero connections");
        }
        
        const data = await response.json();
        
        // Transform the connections to our interface
        return data.connections.map((conn: any) => ({
          id: conn.id,
          authEventId: data.tokenId,
          tenantId: conn.tenantId,
          tenantName: conn.tenantName,
          tenantType: conn.tenantType,
          createdDateUtc: conn.createdDateUtc,
          updatedDateUtc: conn.updatedDateUtc,
          xeroTokenId: data.tokenId
        }));
      } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
      }
    },
    enabled: !!selectedTokenId,
  });

  // Fetch assigned connection
  const { data: assignedConnection, isLoading: isLoadingAssigned, refetch: refetchAssigned } = useQuery({
    queryKey: ["assigned-xero-connection", clientBusiness.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("xero_connections")
          .select("*")
          .eq("tenant_id", clientBusiness.id)
          .maybeSingle();
          
        if (error) throw error;
        
        return data ? {
          id: data.id,
          tenantId: data.tenant_id,
          tenantName: data.tenant_name,
          tenantType: data.tenant_type,
          createdDateUtc: data.created_date_utc,
          updatedDateUtc: data.updated_date_utc,
          xeroTokenId: data.xero_token_id,
          authEventId: ""
        } as XeroConnection : null;
      } catch (error) {
        console.error("Error fetching assigned connection:", error);
        return null;
      }
    },
  });

  // Reset selected connection when token changes
  useEffect(() => {
    setSelectedConnectionId("");
  }, [selectedTokenId]);

  // Handle assigning connection to client business
  const handleAssignConnection = async () => {
    if (!selectedConnectionId || !selectedTokenId) {
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

      // Update client business with xero_connected flag
      const { error: updateError } = await supabase
        .from("client_businesses")
        .update({ 
          xero_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", clientBusiness.id);

      if (updateError) throw updateError;

      // Update xero_connection with client_business_id
      const { error: connectionError } = await supabase
        .from("xero_connections")
        .update({
          tenant_id: clientBusiness.id,
          updated_at: new Date().toISOString()
        })
        .eq("xero_id", selectedConnection.id);

      if (connectionError) throw connectionError;

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
    if (!assignedConnection) {
      return;
    }

    setIsAssigning(true);

    try {
      // Update client business with xero_connected flag
      const { error: updateError } = await supabase
        .from("client_businesses")
        .update({ 
          xero_connected: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", clientBusiness.id);

      if (updateError) throw updateError;

      // Update xero_connection to remove client_business_id
      const { error: connectionError } = await supabase
        .from("xero_connections")
        .update({
          tenant_id: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", assignedConnection.id);

      if (connectionError) throw connectionError;

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

  // Refresh connections
  const handleRefreshConnections = () => {
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
              This client is connected to Xero tenant: <span className="font-medium">{assignedConnection.tenantName}</span>
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
                    onClick={handleRefreshConnections}
                    title="Refresh tokens"
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
                            {connection.tenantName} ({connection.tenantType})
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
