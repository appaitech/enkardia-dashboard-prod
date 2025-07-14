import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  TrendingUp,
  User,
  ChevronRight
} from "lucide-react";

const TaskDashboard = ({ tasks, isLoadingTasks, isErrorTasks, refetchTasks }) => {
  // Task statistics
  const getTaskStats = () => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        byType: {}
      };
    }

    const stats = {
      total: tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      byType: {}
    };

    const now = new Date();

    tasks.forEach(task => {
      // Count by status
      switch (task.status?.toLowerCase()) {
        case 'pending':
          stats.pending++;
          break;
        case 'in_progress':
        case 'in progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
        default:
          stats.pending++;
      }

      // Count overdue tasks
      if (task.due_date && new Date(task.due_date) < now && task.status?.toLowerCase() !== 'completed') {
        stats.overdue++;
      }

      // Count by type
      const taskType = task.type || 'Other';
      stats.byType[taskType] = (stats.byType[taskType] || 0) + 1;
    });

    return stats;
  };

  const stats = getTaskStats();

  // Status configuration
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      count: stats.pending
    },
    inProgress: {
      label: 'In Progress',
      color: 'bg-blue-100 text-blue-800',
      icon: TrendingUp,
      count: stats.inProgress
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      count: stats.completed
    },
    overdue: {
      label: 'Overdue',
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle,
      count: stats.overdue
    }
  };

  // Get recent tasks (last 5)
  const getRecentTasks = () => {
    if (!tasks || tasks.length === 0) return [];
    
    return tasks
      .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
      .slice(0, 5);
  };

  const recentTasks = getRecentTasks();

  // Get priority tasks (overdue or due soon)
  const getPriorityTasks = () => {
    if (!tasks || tasks.length === 0) return [];

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks
      .filter(task => {
        if (task.status?.toLowerCase() === 'completed') return false;
        if (!task.due_date) return false;
        
        const dueDate = new Date(task.due_date);
        return dueDate <= tomorrow;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  };

  const priorityTasks = getPriorityTasks();

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    const config = statusConfig[statusLower] || statusConfig.pending;
    
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status?.toLowerCase() === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  if (isLoadingTasks) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Tasks Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isErrorTasks) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Tasks Overview</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Failed to load tasks</p>
            <Button onClick={refetchTasks} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Tasks Overview</h2>
      
      {/* Task Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{config.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{config.count}</p>
                  </div>
                  <div className={`p-3 rounded-full ${config.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Type Breakdown */}
      {Object.keys(stats.byType).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Task Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Tasks & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              Priority Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {priorityTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-500">No urgent tasks!</p>
                <p className="text-sm text-slate-400">All tasks are on track.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {priorityTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{task.title || task.name}</p>
                        {isOverdue(task) && (
                          <Badge variant="destructive" className="ml-2">Overdue</Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        Due: {formatDate(task.due_date)}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No tasks yet</p>
                <p className="text-sm text-slate-400">Tasks will appear here once created.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{task.title || task.name}</p>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <User className="mr-1 h-3 w-3" />
                        {task.assigned_to || 'Unassigned'}
                        {task.due_date && (
                          <>
                            <span className="mx-2">•</span>
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(task.due_date)}
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {stats.total > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            View All Tasks
          </Button>
          {stats.overdue > 0 && (
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              View Overdue ({stats.overdue})
            </Button>
          )}
          {stats.pending > 0 && (
            <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
              View Pending ({stats.pending})
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;