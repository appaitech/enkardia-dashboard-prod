
import React from "react";
import { useLocation } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Bell, 
  CheckCircle2 
} from "lucide-react";

const UserDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-slate-50">
      <UserSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">User Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user?.name}</p>
          </div>
          
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
                <CardTitle className="text-lg font-medium flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-amber-600" />
                  Notifications
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
            
            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                <CardDescription>Your activity from the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
