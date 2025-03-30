import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getClientBusinesses, searchClientBusinesses } from "@/services/clientService";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Building
} from "lucide-react";
import { AddClientForm } from "@/components/AddClientForm";

const ClientsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const itemsPerPage = 5;

  const { data: clients, isLoading, isError, refetch } = useQuery({
    queryKey: ["clients", searchQuery],
    queryFn: () => searchQuery 
      ? searchClientBusinesses(searchQuery) 
      : getClientBusinesses(),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/admin/clients/${clientId}`);
  };

  const paginatedClients = clients ? clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) : [];
  
  const totalPages = clients ? Math.ceil(clients.length / itemsPerPage) : 0;

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Client Businesses</h1>
              <p className="text-slate-500">Manage your client businesses and their Xero connections</p>
            </div>
            
            <div>
              <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={16} />
                    Add New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <AddClientForm 
                    onClose={() => setIsAddClientOpen(false)}
                    onSuccess={() => refetch()}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex justify-between mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search clients by name, contact, email or industry..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                All
              </Button>
              <Button variant="outline" size="sm" className="text-green-600">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Xero Connected
              </Button>
              <Button variant="outline" size="sm" className="text-amber-600">
                <XCircle className="mr-1 h-4 w-4" />
                Not Connected
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Xero Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="mt-2 text-sm text-slate-500">Loading clients...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <p className="mt-2 text-sm text-slate-500">Error loading clients</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => refetch()}
                        >
                          Try again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Building className="h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-sm text-slate-500">
                          {searchQuery ? "No clients match your search" : "No clients found"}
                        </p>
                        {searchQuery && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleViewClient(client.id)}>
                      <TableCell>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-slate-500">{client.email}</div>
                      </TableCell>
                      <TableCell>{client.contactName}</TableCell>
                      <TableCell>
                        {client.industry ? (
                          <Badge variant="outline" className="bg-slate-50">
                            {client.industry}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.xeroConnected ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100">
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Not Connected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewClient(client.id);
                          }}
                        >
                          View
                          <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {!isLoading && !isError && clients && clients.length > 0 && (
              <div className="border-t p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsList;
