
import React, { useState } from 'react';
import { Pothole } from '@/types';
import { AlertTriangle, ThumbsUp } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PotholeMarkerProps {
  pothole: Pothole;
  position?: { left: string; top: string }; // Allow position override
}

const PotholeMarker: React.FC<PotholeMarkerProps> = ({ pothole, position }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(pothole.upvotes);

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

  // Use provided position or generate random position for demonstration
  const leftPosition = position?.left || `${Math.random() * 80 + 10}%`;
  const topPosition = position?.top || `${Math.random() * 80 + 10}%`;

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!upvoted) {
      setUpvoted(true);
      setLocalUpvotes(prev => prev + 1);
      pothole.upvotes += 1; // Update the actual pothole object
      toast.success(`Upvoted pothole at ${pothole.address}`);
    } else {
      toast.info("You've already upvoted this pothole");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "absolute z-10 -translate-x-1/2 -translate-y-1/2 group",
            severityColor[pothole.severity]
          )}
          style={{ 
            left: leftPosition, 
            top: topPosition 
          }}
        >
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-5 w-5 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform",
              "hover:animate-pulse"
            )}></div>
            {pothole.severity === 'high' && (
              <AlertTriangle className="h-4 w-4 text-white -mt-4 ml-4" />
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 map-overlay z-50 bg-card/95 border-border shadow-lg" align="start">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm text-foreground">{pothole.address}</h3>
              <p className="text-xs text-muted-foreground">
                Reported {new Date(pothole.reportedAt).toLocaleDateString()}
              </p>
            </div>
            <Badge
              variant={pothole.status === 'resolved' ? 'default' : 'outline'}
              className={pothole.status === 'resolved' ? 'bg-green-500 hover:bg-green-600 text-white' : 'text-foreground'}
            >
              {statusLabel[pothole.status]}
            </Badge>
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-foreground">{pothole.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className={cn(
                severityColor[pothole.severity],
                pothole.severity === 'low' ? 'text-white' : 
                pothole.severity === 'medium' ? 'text-black' : 'text-white'
              )}>
                {pothole.severity.charAt(0).toUpperCase() + pothole.severity.slice(1)} Severity
              </Badge>
              <button 
                onClick={handleUpvote}
                className={cn(
                  "text-xs px-2 py-1 rounded flex items-center gap-1",
                  upvoted 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                )}
              >
                <ThumbsUp className="h-3 w-3" />
                {localUpvotes}
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="h-24 bg-background/60 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Photo unavailable</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PotholeMarker;
