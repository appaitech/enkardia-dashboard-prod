import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Link, Search, RefreshCcw, Users, Info } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XeroConnection, XeroToken } from "@/types/xero";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const XeroSyncLoader: React.FC = () => {
  const [progress, setProgress] = useState(30);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 1000);
    
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state && !isProcessing) {
      const processXeroAuth = async () => {
        try {
          setIsProcessing(true);
          
          const response = await supabase.functions.invoke('xero-auth', {
            body: { 
              action: 'callback',
              code,
              state
            }
          });
          
          if (response.error) {
            throw new Error(response.error.message || 'Failed to authenticate with Xero');
          }
          
          toast({
            title: "Xero Connected Successfully",
            description: `Connected ${response.data.connections.length} organizations from Xero.`,
          });
          
          navigate('/admin/xero-connections', { replace: true });
        } catch (error) {
          console.error('Error processing Xero auth:', error);
          toast({
            title: "Xero Connection Failed",
            description: error.message || "There was an error connecting to Xero",
            variant: "destructive",
          });
          
          navigate('/admin/xero-connections', { replace: true });
        }
      };
      
      processXeroAuth();
    }
    
    return () => clearInterval(timer);
  }, [location.search, navigate, toast, isProcessing]);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Syncing with Xero</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-navy-700">
            Connecting to Xero API and syncing your organization data...
          </p>
          <Progress value={progress} className="h-2 w-full" />
        </div>
        <div className="mt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const XeroConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<XeroConnection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<XeroConnection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [xeroTokens, setXeroTokens] = useState<XeroToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<XeroToken | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const hasXeroAuthParams = searchParams.has('code') && searchParams.has('state');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('xero-auth', {
          body: { action: 'get-tokens' }
        });

        if (error) {
          console.error("Error fetching Xero tokens:", error);
          return;
        }

        const tokens = data.tokens || [];
        setXeroTokens(tokens);
        
        if (tokens.length > 0) {
          setSelectedToken(tokens[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Xero tokens:", error);
        setIsLoading(false);
      }
    };

    if (!hasXeroAuthParams) {
      fetchTokens();
    }
  }, [hasXeroAuthParams, isFetching]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!selectedToken) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("xero_connections")
          .select("*")
          .eq("xero_token_id", selectedToken.id)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching Xero connections:", error);
          toast({
            title: "Error",
            description: "Failed to fetch Xero connections",
            variant: "destructive",
          });
          setConnections([]);
        } else {
          const transformedConnections = data.map(conn => ({
            id: conn.xero_id,
            authEventId: "",
            tenantId: conn.tenant_id,
            tenantType: conn.tenant_type,
            tenantName: conn.tenant_name,
            createdDateUtc: conn.created_date_utc,
            updatedDateUtc: conn.updated_date_utc,
            xeroTokenId: conn.xero_token_id
          }));
          
          setConnections(transformedConnections);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Xero connections:", error);
        toast({
          title: "Error",
          description: "Failed to fetch Xero connections",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    if (!hasXeroAuthParams) {
      fetchConnections();
    }
  }, [hasXeroAuthParams, toast, isFetching, selectedToken]);

  useEffect(() => {
    const results = connections.filter(connection =>
      connection.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConnections(results);
    setCurrentPage(1);
  }, [searchTerm, connections]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push("ellipsis1");
      }
      
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push("ellipsis2");
      }
      
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handleAddNewConnection = async () => {
    try {
      console.log("Initiating Xero auth...");
      
      const { data, error } = await supabase.functions.invoke('xero-auth', {
        method: 'POST',
        body: { action: 'authorize' }
      });
      
      if (error) {
        console.error("Xero auth error:", error);
        throw new Error(error.message || 'Failed to get Xero authorization URL');
      }
      
      console.log("Xero auth response:", data);
      
      if (!data?.url) {
        throw new Error('No authorization URL returned from Xero auth endpoint');
      }
      
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating Xero auth:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect to Xero",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePath="/admin/xero-connections" />
      <div className="flex-1 overflow-auto">
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-navy-700">Xero Connections</h1>
            <Button 
              onClick={handleAddNewConnection}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Xero Connection
            </Button>
          </div>

          {hasXeroAuthParams ? (
            <XeroSyncLoader />
          ) : (
            <Card>
              {isLoading ? (
                <CardContent className="flex justify-center items-center py-8">
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              ) : xeroTokens.length === 0 ? (
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Info size={48} className="text-navy-500 mb-4" />
                  <h2 className="text-xl font-semibold text-navy-700 mb-2">
                    No Xero Tokens Found
                  </h2>
                  <p className="text-navy-500 mb-6">
                    You haven't connected any Xero accounts yet. Click the "Add New Xero Connection" button to get started.
                  </p>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-end">
                      <CardTitle>Connected Organisations</CardTitle>
                      {xeroTokens.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Users size={16} />
                              {selectedToken ? renderTokenName(selectedToken) : "Select Xero User"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Xero Users</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {xeroTokens.map((token) => (
                              <DropdownMenuItem 
                                key={token.id} 
                                onClick={() => handleTokenSelect(token)}
                                className={selectedToken?.id === token.id ? "bg-navy-50" : ""}
                              >
                                {renderTokenName(token)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="text-sm text-navy-500 font-medium mt-2">
                      Showing {currentItems.length} of {filteredConnections.length} organisations
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex justify-between items-center">
                      <div className="relative w-full sm:max-w-sm">
                        <Input
                          type="text"
                          placeholder="Search organisations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsFetching(prev => !prev)}
                        className="ml-2"
                        title="Refresh connections"
                        disabled={isFetching}
                      >
                        <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} />
                      </Button>
                    </div>
                    
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-navy-50/80">
                            <TableHead className="font-semibold">Organisation</TableHead>
                            <TableHead className="font-semibold">Tenant ID</TableHead>
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="font-semibold">Created</TableHead>
                            <TableHead className="font-semibold">Last Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading || isFetching ? (
                            Array(3).fill(0).map((_, index) => (
                              <TableRow key={`loading-${index}`}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-40" />
                                  </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              </TableRow>
                            ))
                          ) : currentItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                {searchTerm 
                                  ? "No matching Xero connections found." 
                                  : selectedToken 
                                    ? "No Xero connections found for this user. Click \"Refresh Connections\" to update or add a new connection."
                                    : "No Xero tokens found. Click \"Add New Xero Connection\" to connect an organisation."}
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentItems.map((connection) => (
                              <TableRow key={connection.id} className="hover:bg-navy-50/20">
                                <TableCell className="font-medium flex items-center gap-2">
                                  <Link size={16} className="text-navy-400" />
                                  {connection.tenantName}
                                </TableCell>
                                <TableCell className="font-mono text-sm text-navy-600">
                                  {connection.tenantId.substring(0, 8)}...
                                </TableCell>
                                <TableCell>{connection.tenantType}</TableCell>
                                <TableCell>{formatDate(connection.createdDateUtc)}</TableCell>
                                <TableCell>{formatDate(connection.updatedDateUtc)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {filteredConnections.length > 0 && (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                            
                            {getPageNumbers().map((pageNumber, index) => (
                              <PaginationItem key={index}>
                                {pageNumber === "ellipsis1" || pageNumber === "ellipsis2" ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    isActive={currentPage === pageNumber}
                                    onClick={() => typeof pageNumber === 'number' && setCurrentPage(pageNumber)}
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default XeroConnectionsPage;
