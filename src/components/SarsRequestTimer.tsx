import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ExternalLink,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface SarsRequestTimerProps {
  requestDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  documentType: string;
  reference?: string;
}

const SarsRequestTimer: React.FC<SarsRequestTimerProps> = ({
  requestDate,
  status,
  documentType,
  reference
}) => {
  const [daysRemaining, setDaysRemaining] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const deadline = new Date(requestDate);
      deadline.setDate(deadline.getDate() + 21); // 21 days from request date
      
      const total = 21; // Total days to wait
      const elapsed = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = total - elapsed;
      
      setDaysRemaining(Math.max(0, remaining));
      setProgress(Math.min(100, (elapsed / total) * 100));
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(timer);
  }, [requestDate]);

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'overdue':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getBadgeVariant = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">SARS Document Request</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {reference || 'No reference'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${getBadgeVariant()} capitalize`}
            >
              {status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in SARS
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Document Type</span>
              <span className="font-medium">{documentType}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="text-sm text-muted-foreground block">Request Date</span>
              <span className="font-medium">
                {requestDate.toLocaleDateString()}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="text-sm text-muted-foreground block">Expected Response</span>
              <span className="font-medium">
                {new Date(requestDate.getTime() + (21 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {status === 'completed' ? 'Completed' : 
                 status === 'overdue' ? 'Overdue' :
                 `${daysRemaining} days remaining`}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
          </div>

          {status === 'pending' && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Estimated completion in {daysRemaining} days</span>
              </div>
            </div>
          )}
          
          {status === 'overdue' && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Response overdue by {Math.abs(daysRemaining)} days</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SarsRequestTimer; 