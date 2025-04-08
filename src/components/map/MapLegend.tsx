
import React, { useState } from 'react';
import { AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const MapLegend: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const handleSeverityClick = (severity: string) => {
    setHighlighted(prev => prev === severity ? null : severity);
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md text-xs animate-fade-in border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Damage Severity</h4>
        <div className="flex gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Info className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-xs">
              <p className="mb-2 font-medium">Damage Classification:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><span className="font-semibold text-severity-high">Critical</span>: Requires immediate attention, safety hazard. Potential for accidents and vehicle damage.</li>
                <li><span className="font-semibold text-severity-medium">Moderate</span>: Affects driving experience, should be fixed soon. May cause discomfort or minor vehicle wear.</li>
                <li><span className="font-semibold text-severity-low">Minor</span>: Surface level damage, minimal impact. Usually cosmetic issues with the road surface.</li>
              </ul>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-muted-foreground">All damage levels are assessed using AI analysis of road images and reported incidents.</p>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5"
            onClick={() => setExpanded(prev => !prev)}
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="flex items-center gap-4 p-1">
          <div 
            className={`flex items-center group transition-all cursor-pointer ${highlighted === 'critical' ? 'scale-110' : 'hover:scale-105'}`}
            onClick={() => handleSeverityClick('critical')}
          >
            <div className="h-4 w-4 bg-severity-high rounded-full mr-1.5 group-hover:animate-pulse"></div>
            <span className="group-hover:font-medium">Critical</span>
            {highlighted === 'critical' && (
              <Badge variant="outline" className="ml-1 h-4 px-1">Active</Badge>
            )}
          </div>
          <div 
            className={`flex items-center group transition-all cursor-pointer ${highlighted === 'moderate' ? 'scale-110' : 'hover:scale-105'}`}
            onClick={() => handleSeverityClick('moderate')}
          >
            <div className="h-4 w-4 bg-severity-medium rounded-full mr-1.5 group-hover:animate-pulse"></div>
            <span className="group-hover:font-medium">Moderate</span>
            {highlighted === 'moderate' && (
              <Badge variant="outline" className="ml-1 h-4 px-1">Active</Badge>
            )}
          </div>
          <div 
            className={`flex items-center group transition-all cursor-pointer ${highlighted === 'minor' ? 'scale-110' : 'hover:scale-105'}`}
            onClick={() => handleSeverityClick('minor')}
          >
            <div className="h-4 w-4 bg-severity-low rounded-full mr-1.5 group-hover:animate-pulse"></div>
            <span className="group-hover:font-medium">Minor</span>
            {highlighted === 'minor' && (
              <Badge variant="outline" className="ml-1 h-4 px-1">Active</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
