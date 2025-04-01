import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserSidebar from "@/components/UserSidebar";
import { getUserClientBusinesses } from "@/services/invitationService";
import { 
  Building, 
  Boxes, 
  FileText, 
  Calendar, 
  Settings, 
  ChevronRight,
  Loader2,
  RefreshCcw,
  AlertTriangle,
  UserCircle
} from "lucide-react";
import { DbClientBusiness } from "@/types/client";

const UserDashboard = () => {
  const { user } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const { 
    data: clientBusinesses,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["user-client-businesses", user?.id],
    queryFn: () => getUserClientBusinesses(user?.id || ""),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (clientBusinesses?.length && !selectedBusinessId) {
      const validBusinesses = clientBusinesses.filter(business => business !== null);
      if (validBusinesses.length > 0) {
        setSelectedBusinessId(validBusinesses[0].id);
      }
    }
  }, [clientBusinesses, selectedBusinessId]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/dashboard" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading your client businesses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/dashboard" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
            <p className="mt-2 text-slate-500">There was a problem loading your client businesses</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validBusinesses = clientBusinesses?.filter(business => business !== null) || [];
  
  if (validBusinesses.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50">
        <UserSidebar activePath="/user/dashboard" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Building className="h-12 w-12 text-slate-300 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">No Client Businesses</h2>
            <p className="mt-2 text-slate-500">You don't have access to any client businesses yet</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedBusiness = selectedBusinessId 
    ? validBusinesses.find(b => b && b.id === selectedBusinessId) || validBusinesses[0]
    : validBusinesses[0];

  return (
    <div className="flex h-screen bg-slate-50">
      <UserSidebar activePath="/user/dashboard" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <UserCircle className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-800">
                  Welcome, {user?.name || 'User'}
                </h1>
              </div>
              <p className="text-slate-500 mt-2">
                {user?.accountType === 'CONSOLE' 
                  ? 'Console Administrator Dashboard' 
                  : 'Your Client Business Dashboard'}
              </p>
            </div>
          </div>
          
          {validBusinesses.length > 1 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Client Businesses</CardTitle>
                <CardDescription>
                  Select a client business to view its dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {validBusinesses.map((business) => (
                    <Button
                      key={business.id}
                      variant={business.id === selectedBusinessId ? "default" : "outline"}
                      className={`flex items-center justify-between h-auto py-3 ${
                        business.id === selectedBusinessId ? "bg-blue-600" : ""
                      }`}
                      onClick={() => setSelectedBusinessId(business.id)}
                    >
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>{business.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {selectedBusiness && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">{selectedBusiness.name}</h2>
                <div className="flex items-center mt-1 text-sm text-slate-500">
                  <span>{selectedBusiness.industry || "No industry specified"}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Boxes className="mr-2 h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedBusiness.xero_connected ? (
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
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <AlertTriangle className="h-12 w-12 text-slate-300" />
                        <p className="mt-2 text-slate-500">No financial data available</p>
                        <p className="text-sm text-slate-400 text-center mt-1">
                          This client is not connected to Xero yet
                        </p>
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
                      <div className="text-center text-slate-500 py-4">
                        No recent activity to display
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-slate-500 py-4">
                    No documents available
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Browse Documents
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-slate-500 py-4">
                    Update your account preferences
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Manage Settings
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Business Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedBusiness && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-slate-500">Contact Name</span>
                          <p>{selectedBusiness.contact_name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Email</span>
                          <p>{selectedBusiness.email}</p>
                        </div>
                        {selectedBusiness.phone && (
                          <div>
                            <span className="text-xs text-slate-500">Phone</span>
                            <p>{selectedBusiness.phone}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
