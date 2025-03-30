
import React from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  BarChart, 
  ArrowUpRight, 
  Activity, 
  ChevronDown, 
  ChevronUp
} from "lucide-react";

const AdminDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user?.name}</p>
          </div>
          
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
                <CardTitle className="text-xl font-semibold">Recent User Activities</CardTitle>
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
            
            {/* System Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">System Health</CardTitle>
              </CardHeader>
              <CardContent>
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
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Network</span>
                      <span className="text-sm text-green-600">Excellent</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "12%" }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">12% - 45Mbps/350Mbps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
