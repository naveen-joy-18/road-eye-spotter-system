
import React from 'react';
import { MapPin, Route, AlertCircle, Download, Construction, Map as MapIcon, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  mapStyle?: string;
  setMapStyle?: (style: string) => void;
  showRealMap?: () => void;
}

const MapLayers: React.FC<MapLayersProps> = ({ 
  visibleLayers, 
  toggleLayer, 
  toggleRoadQualityView, 
  downloadMapData,
  mapStyle = 'streets',
  setMapStyle = () => {},
  showRealMap = () => {}
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

  const handleMapStyleChange = (value: string) => {
    setMapStyle(value);
    toast.success(`Map style changed to ${value.charAt(0).toUpperCase() + value.slice(1)}`);
  };

  return (
    <div className="absolute top-32 right-4 neo-glass p-3 rounded-md shadow-md z-10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-futuristic text-sm tracking-wide text-foreground">Map Layers</h4>
        <Select value={mapStyle} onValueChange={handleMapStyleChange}>
          <SelectTrigger className="w-24 h-7 text-xs">
            <SelectValue placeholder="Map Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="streets">Streets</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
          Potholes {visibleLayers.potholes && <span className="ml-auto text-xs bg-green-600/20 text-green-600 px-1.5 rounded">ON</span>}
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
          Traffic {visibleLayers.traffic && <span className="ml-auto text-xs bg-blue-600/20 text-blue-600 px-1.5 rounded">ON</span>}
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
          Road Quality {visibleLayers.roadQuality && <span className="ml-auto text-xs bg-yellow-600/20 text-yellow-600 px-1.5 rounded">ON</span>}
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
          Construction {visibleLayers.construction && <span className="ml-auto text-xs bg-orange-600/20 text-orange-600 px-1.5 rounded">ON</span>}
        </Button>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full neo-glass font-futuristic"
          onClick={handleDownload}
        >
          <Download className="h-3 w-3 mr-1" />
          Export Data
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full neo-glass font-futuristic bg-primary hover:bg-primary/80"
          onClick={showRealMap}
        >
          <MapIcon className="h-3 w-3 mr-1" />
          Show Real Map
        </Button>
      </div>
    </div>
  );
};

export default MapLayers;
