
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md text-xs animate-fade-in border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Damage Severity</h4>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Info className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 text-xs">
            <p className="mb-2 font-medium">Damage Classification:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><span className="font-semibold text-severity-high">Critical</span>: Requires immediate attention, safety hazard</li>
              <li><span className="font-semibold text-severity-medium">Moderate</span>: Affects driving experience, should be fixed soon</li>
              <li><span className="font-semibold text-severity-low">Minor</span>: Surface level damage, minimal impact</li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-4 p-1">
        <div className="flex items-center group transition-all hover:scale-105">
          <div className="h-4 w-4 bg-severity-high rounded-full mr-1.5 group-hover:animate-pulse"></div>
          <span className="group-hover:font-medium">Critical</span>
        </div>
        <div className="flex items-center group transition-all hover:scale-105">
          <div className="h-4 w-4 bg-severity-medium rounded-full mr-1.5 group-hover:animate-pulse"></div>
          <span className="group-hover:font-medium">Moderate</span>
        </div>
        <div className="flex items-center group transition-all hover:scale-105">
          <div className="h-4 w-4 bg-severity-low rounded-full mr-1.5 group-hover:animate-pulse"></div>
          <span className="group-hover:font-medium">Minor</span>
        </div>
      </div>
    </div>
  );
};
