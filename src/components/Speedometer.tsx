
import React from 'react';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeedometerProps {
  speed: number;
  maxSpeed: number;
  active: boolean;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, maxSpeed, active }) => {
  // Calculate the percentage for the gauge
  const percentage = Math.min((speed / maxSpeed) * 100, 100);
  
  // Determine color based on speed
  const getSpeedColor = () => {
    if (speed < maxSpeed * 0.4) return 'text-green-500';
    if (speed < maxSpeed * 0.7) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className={cn(
      "bg-card/80 border border-border rounded-lg p-3 shadow-md transition-opacity",
      active ? "opacity-100" : "opacity-50"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Vehicle Speed</h3>
        <span className={cn("text-xl font-bold", getSpeedColor())}>
          {Math.round(speed)} <span className="text-xs">km/h</span>
        </span>
      </div>
      
      <div className="relative h-2 bg-background rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute top-0 left-0 h-full transition-all duration-300 rounded-full",
            percentage < 40 ? "bg-green-500" :
            percentage < 70 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>0</span>
        <span>{Math.round(maxSpeed / 2)}</span>
        <span>{maxSpeed}</span>
      </div>
      
      <div className="flex items-center justify-center mt-2 text-muted-foreground">
        <Gauge className="h-4 w-4 mr-1" />
        <span className="text-xs">Speed monitoring active</span>
      </div>
    </div>
  );
};

export default Speedometer;
