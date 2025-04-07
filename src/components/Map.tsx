
import React, { useEffect, useRef, useState } from 'react';
import { MapPosition } from '@/types';
import PotholeMarker from './PotholeMarker';
import { potholes } from '@/data/potholes';
import { 
  Gauge, MapPin, Navigation, Search, Layers, 
  AlertCircle, LocateFixed, Eye, EyeOff, 
  Route, Download, Compass, Info, MapPinOff, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { MapControls } from './map/MapControls';
import { TrafficOverlay } from './map/TrafficOverlay';
import { MapLegend } from './map/MapLegend';
import { MapInfoPanel } from './map/MapInfoPanel';

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
  const [visibleLayers, setVisibleLayers] = useState({
    potholes: true,
    traffic: true,
    roadQuality: false,
    construction: false,
  });
  const [mapProgress, setMapProgress] = useState(0);
  const [mapRegion, setMapRegion] = useState<string>("All India");
  const [mapTabView, setMapTabView] = useState<string>("visualization");
  const [speedLimit, setSpeedLimit] = useState<number>(60);
  const [showSpeedometer, setShowSpeedometer] = useState<boolean>(true);
  const [compassHeading, setCompassHeading] = useState<number>(0);

  useEffect(() => {
    if (mapRef.current) {
      // Simulate loading progress
      const interval = setInterval(() => {
        setMapProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setMapLoaded(true);
              setRoadDamageStats({
                total: potholes.length,
                critical: potholes.filter(p => p.severity === 'high').length,
                moderate: potholes.filter(p => p.severity === 'medium').length,
                minor: potholes.filter(p => p.severity === 'low').length
              });
            }, 500);
            return 100;
          }
          return newProgress;
        });
      }, 150);

      // Simulate compass rotation
      const compassInterval = setInterval(() => {
        setCompassHeading(prev => (prev + 1) % 360);
      }, 100);

      return () => {
        clearInterval(interval);
        clearInterval(compassInterval);
      };
    }
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Detecting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setPosition({
            latitude,
            longitude,
            zoom: 15
          });
          toast.success('Location found! Centered map at your position.');
        },
        (error) => {
          toast.error(`Could not find your location: ${error.message}`);
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setPosition(prev => {
      const newZoom = direction === 'in' 
        ? Math.min(prev.zoom + 1, 20) 
        : Math.max(prev.zoom - 1, 1);
        
      toast.info(`Zoom level: ${newZoom}`);
      
      return {
        ...prev,
        zoom: newZoom
      };
    });
  };

  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'streets' ? 'satellite' : 'streets');
    toast.info(`Switched to ${mapStyle === 'streets' ? 'satellite' : 'streets'} view`);
  };

  const toggleRoadQualityView = () => {
    setRoadQualityView(prev => !prev);
    setVisibleLayers(prev => ({
      ...prev,
      roadQuality: !prev.roadQuality
    }));
    toast.info(roadQualityView ? 'Standard map view activated' : 'Road quality heatmap activated');
  };

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
    toast.info(`${visibleLayers[layer] ? 'Hidden' : 'Showing'} ${layer} layer`);
  };

  const handleRegionChange = (region: string) => {
    setMapRegion(region);
    
    // Set coordinates based on selected region
    switch(region) {
      case "North India":
        setPosition({ latitude: 28.6139, longitude: 77.2090, zoom: 7 }); // Delhi
        break;
      case "South India":
        setPosition({ latitude: 13.0827, longitude: 80.2707, zoom: 7 }); // Chennai
        break;
      case "East India":
        setPosition({ latitude: 22.5726, longitude: 88.3639, zoom: 7 }); // Kolkata
        break;
      case "West India":
        setPosition({ latitude: 19.0760, longitude: 72.8777, zoom: 7 }); // Mumbai
        break;
      case "Central India":
        setPosition({ latitude: 23.2599, longitude: 77.4126, zoom: 7 }); // Bhopal
        break;
      default:
        setPosition({ latitude: 20.5937, longitude: 78.9629, zoom: 5 }); // All India
    }
    
    toast.success(`Map region updated to ${region}`);
  };

  const downloadMapData = () => {
    const mapData = {
      position,
      potholes: visibleLayers.potholes ? potholes : [],
      trafficDensity: visibleLayers.traffic ? trafficDensity : 0,
      roadQuality: visibleLayers.roadQuality
    };
    
    // Create a downloadable file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "india-road-map-data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success("Map data downloaded successfully!");
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={mapTabView} onValueChange={setMapTabView} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Map Visualization</span>
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            <span>Traffic Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Road Damage Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="mt-4">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-white mt-4 font-medium">Loading India Road Network...</p>
                    <div className="w-64 h-2 bg-gray-700 rounded-full mt-4">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${mapProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-white/70 text-sm mt-2">
                      Loading region: {mapRegion} ({mapProgress}%)
                    </p>
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
              
              {mapLoaded && visibleLayers.potholes && potholes.map((pothole) => (
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

              {mapLoaded && visibleLayers.traffic && (
                <TrafficOverlay density={trafficDensity} />
              )}
            </div>
            
            <MapControls 
              onGetLocation={getUserLocation}
              onZoomIn={() => handleZoom('in')}
              onZoomOut={() => handleZoom('out')}
              onToggleMapStyle={toggleMapStyle}
              onToggleRoadQuality={toggleRoadQualityView}
              roadQualityActive={roadQualityView}
            />

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
            
            {showSpeedometer && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <div className="text-sm font-bold">{speedLimit} km/h</div>
              </div>
            )}

            <div 
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md"
              style={{ transform: `rotate(${compassHeading}deg)` }}
            >
              <Navigation className="h-6 w-6 text-primary" />
            </div>
            
            <div className="absolute bottom-16 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
              Map data © {new Date().getFullYear()} Contributors | India Road Network
            </div>

            {mapLoaded && (
              <MapInfoPanel 
                roadDamageStats={roadDamageStats}
              />
            )}

            {/* Region Selector */}
            <div className="absolute top-16 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{mapRegion}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-48">
                  <div className="p-1">
                    {["All India", "North India", "South India", "East India", "West India", "Central India"].map(region => (
                      <Button
                        key={region}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-normal"
                        onClick={() => handleRegionChange(region)}
                      >
                        {region}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Layer Controls */}
            <div className="absolute top-32 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md">
              <h4 className="font-medium text-sm mb-2">Map Layers</h4>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "w-full justify-start",
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
                    "w-full justify-start",
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
                    "w-full justify-start",
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
                  className="w-full mt-1"
                  onClick={downloadMapData}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Date Display */}
            <div className="absolute top-4 right-20 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString('en-IN')}
            </div>

            {/* Legend */}
            <MapLegend />
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="mt-4">
          <div className="bg-white p-6 rounded-lg border border-border min-h-[400px]">
            <h2 className="text-2xl font-bold mb-4">Traffic Analysis Dashboard</h2>
            <p className="text-gray-500 mb-6">Analyze traffic patterns and congestion levels across India's road network</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Current Traffic Status</h3>
                <div className="flex justify-between items-center">
                  <span>Overall Density:</span>
                  <Badge className="bg-amber-500 hover:bg-amber-600">{trafficDensity}%</Badge>
                </div>
                <div className="h-8 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${trafficDensity}%`,
                      backgroundColor: trafficDensity > 75 ? '#ef4444' : 
                                      trafficDensity > 50 ? '#f97316' : 
                                      trafficDensity > 25 ? '#eab308' : '#22c55e'
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {trafficDensity > 75 ? 'Heavy congestion detected' : 
                  trafficDensity > 50 ? 'Moderate traffic in major areas' : 
                  trafficDensity > 25 ? 'Light traffic conditions' : 'Free flowing traffic'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Speed Regulations</h3>
                <div className="flex justify-between items-center mb-2">
                  <span>Current Limit:</span>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <Badge variant="outline">{speedLimit} km/h</Badge>
                  </div>
                </div>
                <Slider
                  value={[speedLimit]}
                  min={20}
                  max={120}
                  step={5}
                  onValueChange={(value) => setSpeedLimit(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>City: 20-40</span>
                  <span>Highway: 60-80</span>
                  <span>Expressway: 100+</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Regional Traffic Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {["North India", "South India", "East India", "West India", "Central India"].map(region => (
                  <Button 
                    key={region} 
                    variant={mapRegion === region ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleRegionChange(region)}
                  >
                    {region}
                  </Button>
                ))}
              </div>
              
              <div className="h-40 bg-gray-200 rounded-lg mt-4 flex items-end p-4 gap-1">
                {/* Fake traffic chart bars */}
                <div className="h-[20%] w-full bg-green-500 rounded-t"></div>
                <div className="h-[60%] w-full bg-yellow-500 rounded-t"></div>
                <div className="h-[40%] w-full bg-amber-500 rounded-t"></div>
                <div className="h-[80%] w-full bg-red-500 rounded-t"></div>
                <div className="h-[30%] w-full bg-orange-500 rounded-t"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Morning</span>
                <span>Noon</span>
                <span>Evening</span>
                <span>Night</span>
                <span>Average</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="bg-white p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Road Damage Statistics</h2>
            <p className="text-gray-500 mb-6">Comprehensive analysis of road damage across India's transportation network</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border text-center">
                <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
                <p className="text-3xl font-bold">{roadDamageStats.total}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border text-center">
                <h3 className="text-sm font-medium text-gray-500">Critical Damage</h3>
                <p className="text-3xl font-bold text-red-600">{roadDamageStats.critical}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border text-center">
                <h3 className="text-sm font-medium text-gray-500">Moderate Issues</h3>
                <p className="text-3xl font-bold text-yellow-600">{roadDamageStats.moderate}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border text-center">
                <h3 className="text-sm font-medium text-gray-500">Minor Reports</h3>
                <p className="text-3xl font-bold text-green-600">{roadDamageStats.minor}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Severity Distribution</h3>
                <div className="h-40 bg-white rounded-lg p-4 flex items-end justify-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-[60%] w-8 bg-red-500 rounded"></div>
                    <span className="text-xs">Critical</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-[40%] w-8 bg-yellow-500 rounded"></div>
                    <span className="text-xs">Moderate</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-[25%] w-8 bg-green-500 rounded"></div>
                    <span className="text-xs">Minor</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Recent Reports</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {potholes.slice(0, 3).map(pothole => (
                    <div key={pothole.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        pothole.severity === 'high' ? "bg-severity-high" : 
                        pothole.severity === 'medium' ? "bg-severity-medium" : "bg-severity-low"
                      )}></div>
                      <div className="flex-1 text-sm truncate">{pothole.address}</div>
                      <Badge variant={
                        pothole.status === 'resolved' ? "default" : 
                        pothole.status === 'in_progress' ? "secondary" : "outline"
                      }>
                        {pothole.status === 'resolved' ? 'Fixed' : 
                         pothole.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Reports
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Map;
