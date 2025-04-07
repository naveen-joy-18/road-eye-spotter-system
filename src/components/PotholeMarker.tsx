
import React, { useState } from 'react';
import { Pothole } from '@/types';
import { AlertTriangle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface PotholeMarkerProps {
  pothole: Pothole;
}

const PotholeMarker: React.FC<PotholeMarkerProps> = ({ pothole }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Map severity to appropriate colors
  const severityColor = {
    low: 'bg-severity-low',
    medium: 'bg-severity-medium',
    high: 'bg-severity-high',
  };

  const statusLabel = {
    reported: 'Reported',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    resolved: 'Resolved'
  };

  // In a real implementation, we'd position this based on map coordinates
  // For now, using random position for demonstration
  const leftPosition = Math.random() * 80 + 10; // Random position 10-90%
  const topPosition = Math.random() * 80 + 10; // Random position 10-90%

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "absolute z-10 -translate-x-1/2 -translate-y-1/2 group",
            severityColor[pothole.severity]
          )}
          style={{ 
            left: `${leftPosition}%`, 
            top: `${topPosition}%` 
          }}
        >
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-5 w-5 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform",
            )}></div>
            {pothole.severity === 'high' && (
              <AlertTriangle className="h-4 w-4 text-white -mt-4 ml-4" />
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm">{pothole.address}</h3>
              <p className="text-xs text-gray-500">
                Reported {new Date(pothole.reportedAt).toLocaleDateString()}
              </p>
            </div>
            <Badge
              variant={pothole.status === 'resolved' ? 'default' : 'outline'}
              className={pothole.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {statusLabel[pothole.status]}
            </Badge>
          </div>
          
          <div className="mt-3">
            <p className="text-sm">{pothole.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className={cn(
                severityColor[pothole.severity],
                pothole.severity === 'low' ? 'text-white' : 
                pothole.severity === 'medium' ? 'text-black' : 'text-white'
              )}>
                {pothole.severity.charAt(0).toUpperCase() + pothole.severity.slice(1)} Severity
              </Badge>
              <span className="text-xs text-gray-500">
                {pothole.upvotes} upvotes
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="h-24 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Photo unavailable</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PotholeMarker;
