
import React, { useState, useEffect } from 'react';
import { Pothole } from '@/types';
import { AlertTriangle, ThumbsUp, Calendar, BarChart4 } from 'lucide-react';
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
  const [roadAnalysis, setRoadAnalysis] = useState<{
    surfaceIndex: number;
    impactSeverity: number;
    vibrationLevel: number;
    estimatedRepairCost: number;
  } | null>(null);

  useEffect(() => {
    // Generate random road analysis data when pothole is first viewed
    if (isOpen && !roadAnalysis) {
      // Surface quality index (0-100)
      const surfaceIndex = Math.max(0, 100 - (pothole.severity === 'high' ? 
        Math.floor(Math.random() * 50) + 50 : 
        pothole.severity === 'medium' ? 
        Math.floor(Math.random() * 30) + 30 : 
        Math.floor(Math.random() * 20) + 10));
      
      // Impact severity (1-10)
      const impactSeverity = pothole.severity === 'high' ? 
        Math.floor(Math.random() * 3) + 8 : 
        pothole.severity === 'medium' ? 
        Math.floor(Math.random() * 4) + 4 : 
        Math.floor(Math.random() * 3) + 1;
      
      // Vibration level (dB)
      const vibrationLevel = pothole.severity === 'high' ? 
        Math.floor(Math.random() * 20) + 60 : 
        pothole.severity === 'medium' ? 
        Math.floor(Math.random() * 20) + 40 : 
        Math.floor(Math.random() * 20) + 20;
      
      // Estimated repair cost (INR)
      const estimatedRepairCost = pothole.severity === 'high' ? 
        Math.floor(Math.random() * 30000) + 20000 : 
        pothole.severity === 'medium' ? 
        Math.floor(Math.random() * 15000) + 5000 : 
        Math.floor(Math.random() * 5000) + 1000;
      
      setRoadAnalysis({
        surfaceIndex,
        impactSeverity,
        vibrationLevel,
        estimatedRepairCost
      });
    }
  }, [isOpen, pothole.severity, roadAnalysis]);

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

  // Format cost in Indian Rupees
  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(cost);
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
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
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

          {roadAnalysis && (
            <div className="mt-3 border-t border-border pt-2">
              <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                <BarChart4 className="h-3 w-3" /> 
                Advanced Analysis
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <div className="text-muted-foreground">Surface Index</div>
                  <div className="font-medium">{roadAnalysis.surfaceIndex}/100</div>
                </div>
                <div className="text-xs">
                  <div className="text-muted-foreground">Impact Severity</div>
                  <div className="font-medium">{roadAnalysis.impactSeverity}/10</div>
                </div>
                <div className="text-xs">
                  <div className="text-muted-foreground">Vibration Level</div>
                  <div className="font-medium">{roadAnalysis.vibrationLevel} dB</div>
                </div>
                <div className="text-xs">
                  <div className="text-muted-foreground">Est. Repair</div>
                  <div className="font-medium">{formatCost(roadAnalysis.estimatedRepairCost)}</div>
                </div>
              </div>
            </div>
          )}
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
