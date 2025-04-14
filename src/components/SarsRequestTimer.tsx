
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SarsRequestTimerProps {
  requestDate: Date;
  status: 'pending' | 'completed' | 'failed';
  documentType: string;
  reference: string;
}

const SarsRequestTimer: React.FC<SarsRequestTimerProps> = ({
  requestDate,
  status,
  documentType,
  reference
}) => {
  // Calculate days since request
  const daysSinceRequest = Math.floor(
    (new Date().getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // For pending requests, calculate progress 
  // SARS typically takes 21 days to process requests
  const maxProcessingDays = 21;
  const progress = Math.min(Math.round((daysSinceRequest / maxProcessingDays) * 100), 100);
  
  // Format the request date
  const requestDateFormatted = requestDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Determine time remaining for pending requests
  const timeAgo = formatDistanceToNow(requestDate, { addSuffix: true });
  const daysRemaining = Math.max(maxProcessingDays - daysSinceRequest, 0);
  
  // Set styles based on status
  let statusColor = '';
  let statusIcon = null;
  let progressClass = '';
  
  switch (status) {
    case 'completed':
      statusColor = 'text-green-600';
      statusIcon = <CheckCircle className="h-5 w-5 text-green-600" />;
      progressClass = 'bg-green-600';
      break;
    case 'failed':
      statusColor = 'text-red-600';
      statusIcon = <AlertCircle className="h-5 w-5 text-red-600" />;
      progressClass = 'bg-red-600';
      break;
    default:
      statusColor = progress >= 85 ? 'text-amber-600' : 'text-blue-600';
      statusIcon = <Clock className={`h-5 w-5 ${progress >= 85 ? 'text-amber-600' : 'text-blue-600'}`} />;
      progressClass = progress >= 85 ? 'bg-amber-600' : 'bg-blue-600';
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-slate-900">{documentType}</h3>
            <p className="text-sm text-slate-500">Ref: {reference}</p>
          </div>
          {statusIcon}
        </div>
        
        <div className="my-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Requested {timeAgo}</span>
            <span className={statusColor}>
              {status === 'completed' 
                ? 'Completed' 
                : status === 'failed' 
                  ? 'Failed' 
                  : daysRemaining > 0 
                    ? `~${daysRemaining} days remaining` 
                    : 'Expected soon'}
            </span>
          </div>
          
          <Progress 
            value={status === 'completed' ? 100 : progress} 
            className="h-2"
            // Use the className for the indicator instead
            indicatorClassName={progressClass}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>{requestDateFormatted}</span>
          <span>Target: {maxProcessingDays} days</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SarsRequestTimer;
