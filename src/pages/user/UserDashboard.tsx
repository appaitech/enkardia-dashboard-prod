
import React from "react";
import { useLocation } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Bell, 
  CheckCircle2,
  ShieldCheck,
  Info
} from "lucide-react";

const UserDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  
  return (
    <div className="flex h-screen bg-slate-50">
      <UserSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Client Dashboard</h1>
              <p className="text-slate-500">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-green-500">{user?.accountType}</Badge>
              <Badge className={user?.role === "ADMIN" ? "bg-purple-500" : "bg-slate-500"}>
                {user?.role}
              </Badge>
            </div>
          </div>
          
          {isAdmin && (
            <Alert className="mb-6 bg-purple-50 border-purple-200">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-700">
                You have admin access. You can manage team members and settings.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Upcoming Items */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                    <p className="text-sm font-medium">Team Meeting</p>
                    <p className="text-xs text-slate-500 mt-1">Tomorrow, 2:00 PM</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-sm font-medium">Project Deadline</p>
                    <p className="text-xs text-slate-500 mt-1">Friday, 5:00 PM</p>
                  </div>
                  <Button variant="ghost" className="w-full justify-between text-sm text-slate-600" size="sm">
                    View all events <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-sm font-medium">Q3 Report.pdf</p>
                    <p className="text-xs text-slate-500 mt-1">Added yesterday</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-sm font-medium">Project Proposal.docx</p>
                    <p className="text-xs text-slate-500 mt-1">Added 3 days ago</p>
                  </div>
                  <Button variant="ghost" className="w-full justify-between text-sm text-slate-600" size="sm">
                    View all documents <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-amber-600" />
                    Notifications
                  </div>
                  {isAdmin && (
                    <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                      Admin
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                    <p className="text-sm font-medium">New comment on your document</p>
                    <p className="text-xs text-slate-500 mt-1">5 minutes ago</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-sm font-medium">System maintenance scheduled</p>
                    <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
                  </div>
                  <Button variant="ghost" className="w-full justify-between text-sm text-slate-600" size="sm">
                    View all notifications <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Tasks</CardTitle>
                <CardDescription>Manage your ongoing tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { task: "Complete project documentation", due: "Today", status: "In Progress", priority: "High" },
                    { task: "Review client proposal", due: "Tomorrow", status: "Not Started", priority: "Medium" },
                    { task: "Update personal profile", due: "Today", status: "Complete", priority: "Low" },
                    { task: "Schedule team meeting", due: "Next Week", status: "In Progress", priority: "Medium" },
                    { task: "Submit expense report", due: "Friday", status: "Not Started", priority: "High" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-3 border rounded-md">
                      <div className="flex items-start space-x-3">
                        <div className={`mt-0.5 ${
                          item.status === "Complete" 
                            ? "text-green-500" 
                            : item.status === "In Progress" 
                              ? "text-amber-500" 
                              : "text-slate-300"
                        }`}>
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            item.status === "Complete" ? "line-through text-slate-500" : ""
                          }`}>{item.task}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Due: {item.due}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.priority === "High" 
                            ? "bg-red-100 text-red-700" 
                            : item.priority === "Medium" 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-green-100 text-green-700"
                        }`}>
                          {item.priority}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.status === "Complete" 
                            ? "bg-green-100 text-green-700" 
                            : item.status === "In Progress" 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-slate-100 text-slate-700"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Activity Summary or Admin Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                  {isAdmin ? "Team Overview" : "Recent Activity"}
                  {isAdmin && (
                    <Badge variant="outline" className="font-normal border-purple-200 bg-purple-50 text-purple-700">
                      Admin Only
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isAdmin ? "Monitor your team's performance" : "Your activity from the past 7 days"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAdmin ? (
                  // Admin-specific content
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div>
                        <p className="font-medium">Team Members</p>
                        <p className="text-2xl font-bold text-blue-700">12</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                      <div>
                        <p className="font-medium">Active Projects</p>
                        <p className="text-2xl font-bold text-green-700">8</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <div>
                        <p className="font-medium">Pending Tasks</p>
                        <p className="text-2xl font-bold text-amber-700">24</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-500" />
                    </div>
                    
                    <div className="pt-2 mt-2 border-t">
                      <Button variant="outline" className="w-full text-sm">
                        Manage Team
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Regular user content
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Documents Viewed</p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-slate-500">12 documents</p>
                        <p className="text-xs text-slate-500">+18% from last week</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Tasks Completed</p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-slate-500">8 tasks</p>
                        <p className="text-xs text-slate-500">+5% from last week</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Time Logged</p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-slate-500">36.5 hours</p>
                        <p className="text-xs text-slate-500">+12% from last week</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t">
                      <Button variant="outline" className="w-full text-sm">
                        View Full Activity Report
                      </Button>
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
                    <ShieldCheck className="h-5 w-5" /> Access Management
                    <Badge className="ml-auto bg-purple-500">Admin Only</Badge>
                  </CardTitle>
                  <CardDescription className="text-purple-700">Manage team permissions and access</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">Team Members</h3>
                      <p className="text-sm text-slate-500">Add, remove and manage team members</p>
                    </div>
                    
                    <div className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">Permission Groups</h3>
                      <p className="text-sm text-slate-500">Configure access levels for your team</p>
                    </div>
                    
                    <div className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">Access Logs</h3>
                      <p className="text-sm text-slate-500">Review document and resource access</p>
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

export default UserDashboard;
