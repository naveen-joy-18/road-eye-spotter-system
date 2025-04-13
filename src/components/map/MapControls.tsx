
import React, { useState } from 'react';
import { MapPin, Layers, AlertCircle, ChevronUp, ChevronDown, Map, Globe, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MapControlsProps {
  onGetLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapStyle: () => void;
  onToggleRoadQuality: () => void;
  roadQualityActive: boolean;
  mapStyle?: string;
  setMapStyle?: (style: string) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onGetLocation,
  onZoomIn,
  onZoomOut,
  onToggleMapStyle,
  onToggleRoadQuality,
  roadQualityActive,
  mapStyle = 'streets',
  setMapStyle = () => {}
}) => {
  const [expanded, setExpanded] = useState(true);
  const [locatingPosition, setLocatingPosition] = useState(false);

  const handleGetLocation = () => {
    setLocatingPosition(true);
    // Simulate waiting for location
    onGetLocation();
    setTimeout(() => {
      setLocatingPosition(false);
      toast.success("Location updated", {
        description: "Map centered on your current location"
      });
    }, 1500);
  };

  const handleCollapse = () => {
    setExpanded(!expanded);
    toast.info(expanded ? "Controls collapsed" : "Controls expanded");
  };

  const handleMapStyleChange = (style: string) => {
    setMapStyle(style);
    toast.success(`Map style changed to ${style.charAt(0).toUpperCase() + style.slice(1)}`);
  };

  return (
    <div className="absolute top-4 right-4 map-control-panel p-2 rounded-md shadow-md transition-all duration-300 z-30 bg-card/90 border border-border">
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

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-background shadow-sm hover:bg-muted transition-all"
                    >
                      <Layers className="h-5 w-5 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change map style</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Map Style</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMapStyleChange('streets')} className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  <span>Streets</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMapStyleChange('satellite')} className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Satellite</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMapStyleChange('hybrid')} className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>Hybrid</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMapStyleChange('dark')} className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
