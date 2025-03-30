import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getClientBusinessById } from "@/services/clientService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  Clock,
  Calendar,
  Link2,
  CheckCircle2,
  XCircle,
  Boxes,
  AlertTriangle,
  FileText,
  RefreshCcw
} from "lucide-react";
import { toast } from "sonner";
import ClientDetailUsers from "@/components/ClientDetailUsers";

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: client, isLoading, isError } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientBusinessById(clientId || ""),
    enabled: !!clientId,
  });

  const handleGoBack = () => {
    navigate("/admin/clients");
  };

  const handleConnectXero = () => {
    toast.info("This would connect to Xero API in a real implementation");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activePath={location.pathname} />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-500">Loading client details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activePath={location.pathname} />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Client not found</h2>
            <p className="mt-2 text-slate-500">The client you're looking for doesn't exist or you don't have access</p>
            <Button onClick={handleGoBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients List
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
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="mb-2">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Clients List
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{client.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-slate-50">
                    {client.industry || "No Industry"}
                  </Badge>
                  {client.xeroConnected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Xero Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Xero Not Connected
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                {!client.xeroConnected && user?.role === "ADMIN" && (
                  <Button onClick={handleConnectXero}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Connect to Xero
                  </Button>
                )}
                {client.xeroConnected && user?.role === "ADMIN" && (
                  <Button variant="outline">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh Xero Data
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Client Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Business Name</div>
                  <div className="font-medium">{client.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Industry</div>
                  <div className="font-medium">{client.industry || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Created On</div>
                  <div className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Contact Name</div>
                  <div className="font-medium">{client.contactName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 flex items-center">
                    <Mail className="mr-1 h-3.5 w-3.5" />
                    Email
                  </div>
                  <div className="font-medium">{client.email}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 flex items-center">
                    <Phone className="mr-1 h-3.5 w-3.5" />
                    Phone
                  </div>
                  <div className="font-medium">{client.phone || "Not provided"}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Link2 className="mr-2 h-5 w-5" />
                  Xero Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.xeroConnected ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 text-green-800 rounded-md p-3 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Connected to Xero</p>
                        <p className="text-sm mt-1">Last synced: Today, 10:45 AM</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Xero Organisation</div>
                      <div className="font-medium">{client.name} Ltd</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Connected Since</div>
                      <div className="font-medium">October 12, 2023</div>
                    </div>
                    {user?.role === "ADMIN" && (
                      <Button variant="outline" className="w-full mt-2">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Sync Data
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-50 text-amber-800 rounded-md p-3 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Not connected to Xero</p>
                        <p className="text-sm mt-1">Connect to import financial data</p>
                      </div>
                    </div>
                    {user?.role === "ADMIN" && (
                      <Button className="w-full" onClick={handleConnectXero}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Connect to Xero
                      </Button>
                    )}
                    {user?.role !== "ADMIN" && (
                      <p className="text-sm text-slate-500">
                        Contact an administrator to set up Xero connection.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs Section */}
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Boxes className="mr-2 h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                    <CardDescription>
                      {client.xeroConnected 
                        ? "Data imported from Xero" 
                        : "Xero connection needed to display data"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {client.xeroConnected ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-md">
                            <div className="text-sm text-slate-500">Outstanding Invoices</div>
                            <div className="text-2xl font-semibold">$12,450</div>
                            <div className="text-xs text-slate-500">5 invoices</div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-md">
                            <div className="text-sm text-slate-500">Paid Last Month</div>
                            <div className="text-2xl font-semibold">$8,720</div>
                            <div className="text-xs text-slate-500">3 invoices</div>
                          </div>
                        </div>
                        <div className="h-1 bg-slate-100 w-full">
                          <div 
                            className="h-1 bg-blue-500" 
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <div>YTD: $56,200</div>
                          <div>Target: $87,000</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <AlertTriangle className="h-12 w-12 text-slate-300" />
                        <p className="mt-2 text-slate-500">No financial data available</p>
                        <p className="text-sm text-slate-400 text-center mt-1">
                          Connect this client to Xero to import financial data
                        </p>
                        {user?.role === "ADMIN" && (
                          <Button className="mt-4" onClick={handleConnectXero}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Connect to Xero
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { date: "Today, 10:45 AM", action: "Xero data synced", user: "System" },
                        { date: "Yesterday, 3:20 PM", action: "Updated contact details", user: "John Smith" },
                        { date: "Oct 10, 2023", action: "Added new document", user: "Jane Doe" },
                        { date: "Oct 5, 2023", action: "Connected to Xero", user: "Admin" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                          <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">{item.action}</div>
                            <div className="flex gap-2 text-xs text-slate-500">
                              <span>{item.date}</span>
                              <span>•</span>
                              <span>{item.user}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Client Documents
                    </div>
                    {user?.role === "ADMIN" && (
                      <Button size="sm">
                        Upload Document
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    View and manage documents for {client.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-slate-500 text-sm p-2">
                      Document management would appear here
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Users Tab - New Tab */}
            <TabsContent value="users" className="mt-6">
              {client && (
                <ClientDetailUsers 
                  clientId={client.id} 
                  clientName={client.name} 
                />
              )}
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Activity History
                  </CardTitle>
                  <CardDescription>
                    Complete activity history for {client.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-slate-500 text-sm p-2">
                      Full activity history would appear here
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings Tab - Only for ADMIN */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    Client Settings
                  </CardTitle>
                  <CardDescription>
                    Manage settings for {client.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.role === "ADMIN" ? (
                    <div className="space-y-4">
                      <p className="text-slate-500 text-sm">
                        Client settings and permissions would appear here
                      </p>
                      <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        Delete Client
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded-md flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <p className="text-amber-800">
                        You need administrator privileges to access client settings
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
