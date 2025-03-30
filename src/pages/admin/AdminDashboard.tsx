
import React from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Clock, 
  BarChart, 
  ArrowUpRight, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert,
  Info
} from "lucide-react";

const AdminDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === "ADMIN";
  
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Console Dashboard</h1>
              <p className="text-slate-500">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-blue-500">{user?.accountType}</Badge>
              <Badge className={user?.role === "ADMIN" ? "bg-purple-500" : "bg-slate-500"}>
                {user?.role}
              </Badge>
            </div>
          </div>
          
          {!isAdmin && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                You have standard access. Some administrative features are restricted.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Users</p>
                  <h3 className="text-2xl font-bold mt-1">24,582</h3>
                  <p className="text-sm text-green-600 flex items-center mt-2">
                    <ChevronUp className="h-4 w-4 mr-1" /> 12.5% <span className="text-slate-500 ml-1">vs last month</span>
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Users />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Active Sessions</p>
                  <h3 className="text-2xl font-bold mt-1">1,458</h3>
                  <p className="text-sm text-green-600 flex items-center mt-2">
                    <ChevronUp className="h-4 w-4 mr-1" /> 8.2% <span className="text-slate-500 ml-1">vs last week</span>
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Activity />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Avg. Session Time</p>
                  <h3 className="text-2xl font-bold mt-1">4m 32s</h3>
                  <p className="text-sm text-red-600 flex items-center mt-2">
                    <ChevronDown className="h-4 w-4 mr-1" /> 3.8% <span className="text-slate-500 ml-1">vs last week</span>
                  </p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Clock />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
                  <h3 className="text-2xl font-bold mt-1">12.3%</h3>
                  <p className="text-sm text-green-600 flex items-center mt-2">
                    <ChevronUp className="h-4 w-4 mr-1" /> 4.1% <span className="text-slate-500 ml-1">vs last month</span>
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <BarChart />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                  Recent User Activities
                  {isAdmin && (
                    <Badge variant="outline" className="font-normal border-blue-200 bg-blue-50 text-blue-700">
                      Full Access
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {[
                    { user: "John Doe", action: "Logged in to the system", time: "5 minutes ago" },
                    { user: "Sarah Smith", action: "Updated profile information", time: "30 minutes ago" },
                    { user: "Alex Johnson", action: "Submitted a support request", time: "1 hour ago" },
                    { user: "Mike Brown", action: "Uploaded a new document", time: "2 hours ago" },
                    { user: "Emily Wilson", action: "Changed password", time: "3 hours ago" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-start pb-3 border-b last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{item.user}</p>
                        <p className="text-sm text-slate-500">{item.action}</p>
                      </div>
                      <span className="text-xs text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* System Stats or Admin-only content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                  {isAdmin ? "Security Alerts" : "System Health"}
                  {isAdmin && (
                    <Badge variant="outline" className="font-normal border-purple-200 bg-purple-50 text-purple-700">
                      Admin Only
                    </Badge>
                  )}
                </CardTitle>
                {isAdmin && (
                  <CardDescription>Critical security issues that need attention</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isAdmin ? (
                  // Admin-only content
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Failed Login Attempts</p>
                        <p className="text-sm text-red-600">5 failed attempts from IP 192.168.1.105</p>
                        <p className="text-xs text-slate-500 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Permission Change</p>
                        <p className="text-sm text-amber-600">Role updated for user sarah@example.com</p>
                        <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">System Update</p>
                        <p className="text-sm text-blue-600">Security patch available for deployment</p>
                        <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Standard user content
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Server Load</span>
                        <span className="text-sm text-green-600">Normal</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">45% - 3.2 CPU cores</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm text-amber-600">Warning</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">78% - 6.2/8GB</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Storage</span>
                        <span className="text-sm text-blue-600">Good</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "32%" }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">32% - 128/400GB</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Admin-only section */}
          {isAdmin && (
            <div className="mt-6">
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 border-b border-purple-100">
                  <CardTitle className="text-xl font-semibold text-purple-800 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" /> Admin Controls
                    <Badge className="ml-auto bg-purple-500">Admin Only</Badge>
                  </CardTitle>
                  <CardDescription className="text-purple-700">Advanced system controls and settings</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">User Management</h3>
                      <p className="text-sm text-slate-500">Create, edit and manage user accounts</p>
                    </div>
                    
                    <div className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">Role Configuration</h3>
                      <p className="text-sm text-slate-500">Define permissions and access levels</p>
                    </div>
                    
                    <div className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">System Logs</h3>
                      <p className="text-sm text-slate-500">View detailed activity and security logs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
