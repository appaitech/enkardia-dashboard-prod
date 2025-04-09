
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Link } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XeroConnection } from "@/types/xero";

// Mock data for Xero connections
const mockXeroConnections: XeroConnection[] = [
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
  }
];

const XeroConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<XeroConnection[]>(mockXeroConnections);

  const handleAddNewConnection = () => {
    // In a real implementation, this would open a dialog or redirect to an authentication flow
    // For now, we'll just add a new mock connection
    const newConnection: XeroConnection = {
      id: crypto.randomUUID(),
      authEventId: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      tenantType: "ORGANISATION",
      tenantName: `New Company ${connections.length + 1}`,
      createdDateUtc: new Date().toISOString(),
      updatedDateUtc: new Date().toISOString()
    };
    
    setConnections([...connections, newConnection]);
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Connected Organisations</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {connections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No Xero connections found. Click "Add New Xero Connection" to connect an organisation.
                        </TableCell>
                      </TableRow>
                    ) : (
                      connections.map((connection) => (
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
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default XeroConnectionsPage;
