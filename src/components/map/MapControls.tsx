
import React, { useState } from 'react';
import { MapPin, Layers, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface MapControlsProps {
  onGetLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapStyle: () => void;
  onToggleRoadQuality: () => void;
  roadQualityActive: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onGetLocation,
  onZoomIn,
  onZoomOut,
  onToggleMapStyle,
  onToggleRoadQuality,
  roadQualityActive
}) => {
  const [expanded, setExpanded] = useState(true);
  const [locatingPosition, setLocatingPosition] = useState(false);

  const handleGetLocation = () => {
    setLocatingPosition(true);
    // Simulate waiting for location
    onGetLocation();
    setTimeout(() => {
      setLocatingPosition(false);
    }, 1500);
  };

  const handleCollapse = () => {
    setExpanded(!expanded);
    toast.info(expanded ? "Controls collapsed" : "Controls expanded");
  };

  return (
    <div className="absolute top-4 right-4 map-control-panel p-2 rounded-md shadow-md transition-all duration-300 z-30">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium ml-1">Map Controls</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={handleCollapse}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>
      
      {expanded && (
        <>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className={`bg-background shadow-sm hover:bg-muted transition-all ${locatingPosition ? 'animate-pulse' : ''}`}
                  onClick={handleGetLocation}
                  disabled={locatingPosition}
                >
                  <MapPin className={`h-5 w-5 ${locatingPosition ? 'text-blue-500' : 'text-primary'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get your location</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-background shadow-sm hover:bg-muted transition-all"
                  onClick={onZoomIn}
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-background shadow-sm hover:bg-muted transition-all"
                  onClick={onZoomOut}
                >
                  <span className="text-lg font-bold">−</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom out</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-background shadow-sm hover:bg-muted transition-all"
                  onClick={onToggleMapStyle}
                >
                  <Layers className="h-5 w-5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle map style</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={roadQualityActive ? "default" : "secondary"}
                  className={`${roadQualityActive ? "bg-primary" : "bg-background"} shadow-sm transition-all`}
                  onClick={onToggleRoadQuality}
                >
                  <AlertCircle className={`h-5 w-5 ${roadQualityActive ? "text-white" : "text-primary"}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle road quality view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
};
