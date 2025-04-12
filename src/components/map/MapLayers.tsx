
import React from 'react';
import { MapPin, Route, AlertCircle, Download, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const handleDownload = () => {
    downloadMapData();
    toast.success("Map data exported successfully", {
      description: "Downloaded to your local downloads folder"
    });
  };

  const handleLayerToggle = (layer: 'potholes' | 'traffic' | 'roadQuality' | 'construction') => {
    toggleLayer(layer);
    
    const layerNames = {
      potholes: "Potholes",
      traffic: "Traffic",
      roadQuality: "Road Quality",
      construction: "Construction"
    };
    
    const newState = !visibleLayers[layer];
    toast.info(`${newState ? 'Showing' : 'Hidden'} ${layerNames[layer]} layer`);
  };

  return (
    <div className="absolute top-32 right-4 neo-glass p-3 rounded-md shadow-md z-10">
      <h4 className="font-futuristic text-sm mb-2 tracking-wide text-foreground">Map Layers</h4>
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start font-futuristic",
            visibleLayers.potholes ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => handleLayerToggle('potholes')}
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
          onClick={() => handleLayerToggle('traffic')}
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
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start font-futuristic",
            visibleLayers.construction ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => handleLayerToggle('construction')}
        >
          <Construction className={cn("h-4 w-4 mr-2", !visibleLayers.construction && "opacity-50")} />
          Construction
        </Button>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-1 neo-glass font-futuristic"
          onClick={handleDownload}
        >
          <Download className="h-3 w-3 mr-1" />
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default MapLayers;
