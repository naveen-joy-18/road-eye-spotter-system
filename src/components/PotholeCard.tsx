
import React from 'react';
import { Pothole } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, MapPin, ThumbsUp } from 'lucide-react';

interface PotholeCardProps {
  pothole: Pothole;
}

const PotholeCard: React.FC<PotholeCardProps> = ({ pothole }) => {
  // Map status to display text
  const statusLabel = {
    reported: 'Reported',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    resolved: 'Resolved'
  };

  // Map severity to appropriate colors
  const severityColor = {
    low: 'bg-severity-low',
    medium: 'bg-severity-medium',
    high: 'bg-severity-high',
  };

  const severityText = {
    low: 'text-white',
    medium: 'text-black',
    high: 'text-white',
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="h-24 bg-gray-200 relative">
          {pothole.imageUrl ? (
            <img 
              src={pothole.imageUrl} 
              alt="Pothole" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          
          <Badge 
            variant={pothole.status === 'resolved' ? 'default' : 'outline'}
            className={cn(
              "absolute top-2 right-2",
              pothole.status === 'resolved' ? 'bg-green-500 hover:bg-green-500' : 'bg-white hover:bg-white'
            )}
          >
            {statusLabel[pothole.status]}
          </Badge>

          {pothole.severity === 'high' && (
            <div className="absolute bottom-2 right-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm line-clamp-2">{pothole.address}</p>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <Badge variant="secondary" className={cn(
              severityColor[pothole.severity],
              severityText[pothole.severity]
            )}>
              {pothole.severity.charAt(0).toUpperCase() + pothole.severity.slice(1)}
            </Badge>
            
            <div className="flex items-center gap-1 text-gray-500">
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs">{pothole.upvotes}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatDate(pothole.reportedAt)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2">
            {pothole.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PotholeCard;
