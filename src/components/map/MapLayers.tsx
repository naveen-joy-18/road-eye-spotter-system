
import React from 'react';
import { MapPin, Route, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MapLayersProps {
  visibleLayers: {
    potholes: boolean;
    traffic: boolean;
    roadQuality: boolean;
    construction: boolean;
  };
  toggleLayer: (layer: 'potholes' | 'traffic' | 'roadQuality' | 'construction') => void;
  toggleRoadQualityView: () => void;
  downloadMapData: () => void;
}

const MapLayers: React.FC<MapLayersProps> = ({ 
  visibleLayers, 
  toggleLayer, 
  toggleRoadQualityView, 
  downloadMapData 
}) => {
  return (
    <div className="absolute top-32 right-4 neo-glass p-3 rounded-md shadow-md z-30">
      <h4 className="font-futuristic text-sm mb-2 tracking-wide text-foreground">Map Layers</h4>
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start font-futuristic",
            visibleLayers.potholes ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => toggleLayer('potholes')}
        >
          <MapPin className={cn("h-4 w-4 mr-2", !visibleLayers.potholes && "opacity-50")} />
          Potholes
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start font-futuristic",
            visibleLayers.traffic ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => toggleLayer('traffic')}
        >
          <Route className={cn("h-4 w-4 mr-2", !visibleLayers.traffic && "opacity-50")} />
          Traffic
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start font-futuristic",
            visibleLayers.roadQuality ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => toggleRoadQualityView()}
        >
          <AlertCircle className={cn("h-4 w-4 mr-2", !visibleLayers.roadQuality && "opacity-50")} />
          Road Quality
        </Button>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-1 neo-glass font-futuristic"
          onClick={downloadMapData}
        >
          <Download className="h-3 w-3 mr-1" />
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default MapLayers;
