
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Link, Search, RefreshCcw } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XeroConnection } from "@/types/xero";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const XeroSyncLoader: React.FC = () => {
  const [progress, setProgress] = useState(30);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
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
    
    if (code && state) {
      const processXeroAuth = async () => {
        try {
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
          
          // Clear the URL params and navigate back to the connections page
          navigate('/admin/xero-connections', { replace: true });
        } catch (error) {
          console.error('Error processing Xero auth:', error);
          toast({
            title: "Xero Connection Failed",
            description: error.message || "There was an error connecting to Xero",
            variant: "destructive",
          });
          
          // Clear the URL params and navigate back to the connections page
          navigate('/admin/xero-connections', { replace: true });
        }
      };
      
      processXeroAuth();
    }
    
    return () => clearInterval(timer);
  }, [location.search, navigate, toast]);
  
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
  const location = useLocation();
  const { toast } = useToast();

  // Check for Xero auth parameters in URL
  const searchParams = new URLSearchParams(location.search);
  const hasXeroAuthParams = searchParams.has('code') && searchParams.has('state');

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, fetch data from API
        // For now, using mock data with a delay to simulate API call
        setTimeout(() => {
          setConnections([
            {
              id: "3ed4aea5-6134-429e-85b5-6c908965976c",
              authEventId: "cc830e7a-3813-4f40-9525-7ab1d622fd1d",
              tenantId: "ced0f8e6-bebe-48e8-83b5-1179100e1b73",
              tenantType: "ORGANISATION",
              tenantName: "Demo Company (Global)",
              createdDateUtc: "2025-03-29T15:29:45.6555900",
              updatedDateUtc: "2025-04-09T21:15:31.1928120"
            },
            {
              id: "5af7bec1-7fb0-42c3-9123-4d77a8f98a21",
              authEventId: "d981e54b-aa67-4f23-bc45-9a72c3e56f12",
              tenantId: "f8e33d42-1abc-478d-9c12-7e843f567890",
              tenantType: "ORGANISATION",
              tenantName: "Acme Corporation",
              createdDateUtc: "2025-04-01T09:15:22.1234560",
              updatedDateUtc: "2025-04-08T14:30:45.6789120"
            },
            {
              id: "72e9d1b3-5c8a-4f62-b789-3e21a67d9f34",
              authEventId: "e457a9c1-2d3e-4f56-a789-0b12c3d45e67",
              tenantId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
              tenantType: "ORGANISATION",
              tenantName: "Global Enterprises Ltd",
              createdDateUtc: "2025-03-15T11:42:37.9876540",
              updatedDateUtc: "2025-04-07T16:20:19.8765430"
            },
            {
              id: "89a12c3d-4e5f-67a8-9b0c-1d2e3f4a5b67",
              authEventId: "b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6",
              tenantId: "a1b2c3d4-e5f6-a7b8-c9d0-a1b2c3d4e5f6",
              tenantType: "ORGANISATION",
              tenantName: "TechSolutions Inc",
              createdDateUtc: "2025-03-12T08:19:54.1234567",
              updatedDateUtc: "2025-04-05T11:32:18.7654321"
            },
            {
              id: "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
              authEventId: "d1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6",
              tenantId: "c1d2e3f4-a5b6-c7d8-e9f0-c1d2e3f4a5b6",
              tenantType: "ORGANISATION",
              tenantName: "NextGen Financial",
              createdDateUtc: "2025-02-28T15:45:22.9876543",
              updatedDateUtc: "2025-04-03T09:15:47.3456789"
            },
            {
              id: "b1c2d3e4-f5a6-b7c8-d9e0-a1b2c3d4e5f6",
              authEventId: "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
              tenantId: "e1f2a3b4-c5d6-e7f8-a9b0-e1f2a3b4c5d6",
              tenantType: "ORGANISATION",
              tenantName: "Atlas Consulting Group",
              createdDateUtc: "2025-02-25T12:37:49.8765432",
              updatedDateUtc: "2025-04-01T16:28:35.2345678"
            },
            {
              id: "c1d2e3f4-a5b6-c7d8-e9f0-b1c2d3e4f5a6",
              authEventId: "a1b2c3d4-e5f6-a7b8-c9d0-f1a2b3c4d5e6",
              tenantId: "g1h2i3j4-k5l6-m7n8-o9p0-g1h2i3j4k5l6",
              tenantType: "ORGANISATION",
              tenantName: "Phoenix Enterprises",
              createdDateUtc: "2025-02-20T09:53:15.7654321",
              updatedDateUtc: "2025-03-30T13:42:11.1234567"
            }
          ]);
          setIsLoading(false);
        }, 1000);
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
  }, [hasXeroAuthParams, toast]);

  useEffect(() => {
    // Filter connections based on search term
    const results = connections.filter(connection =>
      connection.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConnections(results);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, connections]);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConnections.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConnections.length / itemsPerPage);
  
  // Function to generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show dots if current page is more than 3
      if (currentPage > 3) {
        pageNumbers.push("ellipsis1");
      }
      
      // Show current page and adjacent pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }
      
      // Show dots if current page is less than total pages - 2
      if (currentPage < totalPages - 2) {
        pageNumbers.push("ellipsis2");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handleAddNewConnection = async () => {
    try {
      console.log("Initiating Xero auth...");
      
      // Call the edge function with the action in the request body
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
      
      // Redirect to Xero authorization page
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch (error) {
      return dateString;
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
              <CardHeader className="pb-3">
                <div className="flex justify-between items-end">
                  <CardTitle>Connected Organisations</CardTitle>
                  <div className="text-sm text-navy-500 font-medium">
                    Showing {currentItems.length} of {filteredConnections.length} organisations
                  </div>
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
                    onClick={() => {
                      setIsLoading(true);
                      // In a real implementation, this would refresh the data from the API
                      setTimeout(() => setIsLoading(false), 1000);
                    }}
                    className="ml-2"
                    title="Refresh connections"
                  >
                    <RefreshCcw size={16} />
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
                      {isLoading ? (
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
                            {searchTerm ? "No matching Xero connections found." : "No Xero connections found. Click \"Add New Xero Connection\" to connect an organisation."}
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
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default XeroConnectionsPage;
