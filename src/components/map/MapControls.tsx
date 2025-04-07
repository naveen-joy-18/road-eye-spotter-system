
import React from 'react';
import { MapPin, Layers, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-gray-100 transition-all"
        onClick={onGetLocation}
      >
        <MapPin className="h-5 w-5 text-primary" />
      </Button>

      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-gray-100 transition-all"
        onClick={onZoomIn}
      >
        <span className="text-lg font-bold">+</span>
      </Button>

      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-gray-100 transition-all"
        onClick={onZoomOut}
      >
        <span className="text-lg font-bold">−</span>
      </Button>

      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-gray-100 transition-all"
        onClick={onToggleMapStyle}
      >
        <Layers className="h-5 w-5 text-primary" />
      </Button>

      <Button
        size="icon"
        variant={roadQualityActive ? "default" : "secondary"}
        className={`${roadQualityActive ? "bg-primary" : "bg-white"} shadow-md transition-all`}
        onClick={onToggleRoadQuality}
      >
        <AlertCircle className={`h-5 w-5 ${roadQualityActive ? "text-white" : "text-primary"}`} />
      </Button>
    </div>
  );
};
