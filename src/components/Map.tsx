import React, { useEffect, useRef, useState } from 'react';
import { MapPosition } from '@/types';
import PotholeMarker from './PotholeMarker';
import { potholes } from '@/data/potholes';
import { Gauge, MapPin, Navigation, Search, Layers, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MapPosition>({
    latitude: 20.5937, // Central India coordinates
    longitude: 78.9629,
    zoom: 5
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [trafficDensity, setTrafficDensity] = useState(50);
  const [roadQualityView, setRoadQualityView] = useState(false);
  const [roadDamageStats, setRoadDamageStats] = useState({
    total: 0,
    critical: 0,
    moderate: 0,
    minor: 0
  });

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        setMapLoaded(true);
        setRoadDamageStats({
          total: potholes.length,
          critical: potholes.filter(p => p.severity === 'high').length,
          moderate: potholes.filter(p => p.severity === 'medium').length,
          minor: potholes.filter(p => p.severity === 'low').length
        });
      }, 1500);
    }
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setPosition({
            latitude,
            longitude,
            zoom: 15
          });
          toast.success('Location found!');
        },
        (error) => {
          toast.error('Could not find your location');
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setPosition(prev => ({
      ...prev,
      zoom: direction === 'in' 
        ? Math.min(prev.zoom + 1, 20) 
        : Math.max(prev.zoom - 1, 1)
    }));
  };

  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'streets' ? 'satellite' : 'streets');
    toast.info(`Switched to ${mapStyle === 'streets' ? 'satellite' : 'streets'} view`);
  };

  const toggleRoadQualityView = () => {
    setRoadQualityView(prev => !prev);
    toast.info(roadQualityView ? 'Standard map view activated' : 'Road quality heatmap activated');
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="visualization">Map Visualization</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Analysis</TabsTrigger>
          <TabsTrigger value="stats">Road Damage Stats</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
        <div 
          ref={mapRef} 
          className="absolute inset-0 bg-gray-200 transition-all duration-500"
          style={{
            backgroundImage: mapStyle === 'streets'
              ? `url("https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${position.longitude},${position.latitude},${position.zoom},0/600x600?access_token=placeholder")`
              : `url("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${position.longitude},${position.latitude},${position.zoom},0/600x600?access_token=placeholder")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: roadQualityView ? 'hue-rotate(180deg) brightness(0.8)' : 'none'
          }}
        >
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-white mt-4 font-medium">Loading India Road Network...</p>
              </div>
            </div>
          )}
          
          {mapLoaded && roadQualityView && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/20 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-yellow-500/30 to-transparent rounded-full blur-xl"></div>
              <div className="absolute top-1/4 left-1/3 w-1/4 h-1/4 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-lg"></div>
            </div>
          )}
          
          {mapLoaded && potholes.map((pothole) => (
            <PotholeMarker key={pothole.id} pothole={pothole} />
          ))}

          {mapLoaded && userLocation && (
            <div 
              className="absolute z-10 animate-pulse"
              style={{ 
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 absolute -left-3 -top-3"></div>
              <div className="mt-2 px-2 py-1 bg-white/90 rounded text-xs font-medium shadow">
                Your Location
              </div>
            </div>
          )}

          {mapLoaded && (
            <div 
              className="absolute inset-0 bg-gradient-to-b from-red-500/0 to-red-500/20 pointer-events-none"
              style={{ opacity: trafficDensity / 200 }}
            ></div>
          )}
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md hover:bg-gray-100 transition-all"
            onClick={getUserLocation}
          >
            <MapPin className="h-5 w-5 text-primary" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md hover:bg-gray-100 transition-all"
            onClick={() => handleZoom('in')}
          >
            <span className="text-lg font-bold">+</span>
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md hover:bg-gray-100 transition-all"
            onClick={() => handleZoom('out')}
          >
            <span className="text-lg font-bold">−</span>
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md hover:bg-gray-100 transition-all"
            onClick={toggleMapStyle}
          >
            <Layers className="h-5 w-5 text-primary" />
          </Button>

          <Button
            size="icon"
            variant={roadQualityView ? "default" : "secondary"}
            className={`${roadQualityView ? "bg-primary" : "bg-white"} shadow-md transition-all`}
            onClick={toggleRoadQualityView}
          >
            <AlertCircle className={`h-5 w-5 ${roadQualityView ? "text-white" : "text-primary"}`} />
          </Button>
        </div>

        <div className="absolute top-4 left-4 w-64">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search locations in India..." 
              className="bg-white pl-8 pr-4 py-2 w-full rounded-md shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Traffic Density</span>
            <span className="text-sm font-medium">{trafficDensity}%</span>
          </div>
          <Slider
            value={[trafficDensity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => setTrafficDensity(value[0])}
            className="w-full"
          />
        </div>
        
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          <div className="text-sm font-bold">60 km/h</div>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md">
          <Navigation className="h-6 w-6 text-primary" />
        </div>
        
        <div className="absolute bottom-16 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
          Map data © {new Date().getFullYear()} Contributors | India Road Network
        </div>

        {mapLoaded && (
          <div className="absolute top-16 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-md shadow-md w-48">
            <h4 className="font-medium text-sm mb-2">Road Damage Report</h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs">Critical</span>
                <Badge variant="destructive" className="text-xs">{roadDamageStats.critical}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Moderate</span>
                <Badge variant="secondary" className="text-xs bg-yellow-500 hover:bg-yellow-600">{roadDamageStats.moderate}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Minor</span>
                <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">{roadDamageStats.minor}</Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
