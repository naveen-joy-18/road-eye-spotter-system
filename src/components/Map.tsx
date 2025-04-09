
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
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface MapProps {
  googleMapsApiKey?: string;
}

const Map: React.FC<MapProps> = ({ googleMapsApiKey }) => {
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
  
  // Simulated map markers
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const loadingIntervalRef = useRef<number | null>(null);
  const compassIntervalRef = useRef<number | null>(null);
  
  // Use our custom hook to simulate map API loading
  const { isLoaded: mapsApiLoaded, loadError } = useGoogleMaps(googleMapsApiKey || '');
  
  const indianCities = [
    { name: "All India", lat: 20.5937, lng: 78.9629, zoom: 5 },
    { name: "Delhi", lat: 28.6139, lng: 77.2090, zoom: 12 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777, zoom: 12 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946, zoom: 12 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, zoom: 12 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639, zoom: 12 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, zoom: 12 },
    { name: "Pune", lat: 18.5204, lng: 73.8567, zoom: 12 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, zoom: 12 },
    { name: "Jaipur", lat: 26.9124, lng: 75.7873, zoom: 12 }
  ];

  // Initialize the map once the API is "loaded"
  useEffect(() => {
    if (!mapsApiLoaded || !mapRef.current) return;
    
    // Start the loading animation
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
            
            // Simulate adding markers
            addPotholeMarkers();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 150);
    loadingIntervalRef.current = interval as unknown as number;

    // Simulated compass rotation
    const compassInterval = setInterval(() => {
      setCompassHeading(prev => (prev + 1) % 360);
    }, 100);
    compassIntervalRef.current = compassInterval as unknown as number;
    
    // Return cleanup function
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      
      if (compassIntervalRef.current) {
        clearInterval(compassIntervalRef.current);
        compassIntervalRef.current = null;
      }
    };
  }, [mapsApiLoaded]);

  // Clean up resources on component unmount
  useEffect(() => {
    return () => {
      // Clear all intervals
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      
      if (compassIntervalRef.current) {
        clearInterval(compassIntervalRef.current);
        compassIntervalRef.current = null;
      }
      
      // Clear any other resources
      setMapMarkers([]);
    };
  }, []);

  // Show error if API fails to load
  useEffect(() => {
    if (loadError) {
      toast.error(`Failed to load Map API: ${loadError.message}`);
      console.error("Map API loading error:", loadError);
    }
  }, [loadError]);

  const addPotholeMarkers = () => {
    // Create simulated markers for potholes
    try {
      const newMarkers = potholes.map(pothole => {
        const lat = position.latitude + (Math.random() - 0.5) * 0.05;
        const lng = position.longitude + (Math.random() - 0.5) * 0.05;
        
        const markerColor = pothole.severity === 'high' ? 'red' : 
                          pothole.severity === 'medium' ? 'orange' : 'green';
        
        return {
          id: pothole.id,
          position: { lat, lng },
          title: `Pothole: ${pothole.address}`,
          color: markerColor,
          info: {
            severity: pothole.severity,
            address: pothole.address,
            reportedAt: pothole.reportedAt,
            status: pothole.status
          },
          visible: true
        };
      });
      
      setMapMarkers(newMarkers);
    } catch (error) {
      console.error("Error creating markers:", error);
      toast.error("Failed to create map markers");
    }
  };

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
          
          // Add a marker for the user's location
          const userMarker = {
            id: 'user-location',
            position: { lat: latitude, lng: longitude },
            title: 'Your Location',
            color: '#4285F4',
            info: {
              severity: 'none',
              address: 'Your current location',
              reportedAt: new Date().toISOString(),
              status: 'active'
            },
            visible: true,
            isUser: true
          };
          
          setMapMarkers(prev => [userMarker, ...prev]);
          
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
    const currentZoom = position.zoom;
    const newZoom = direction === 'in' ? currentZoom + 1 : currentZoom - 1;
    
    setPosition(prev => ({
      ...prev,
      zoom: newZoom
    }));
    
    toast.info(`Zoom level: ${newZoom}`);
  };

  const toggleMapStyle = () => {
    const newStyle = mapStyle === 'streets' ? 'satellite' : 'streets';
    setMapStyle(newStyle);
    toast.info(`Switched to ${newStyle} view`);
  };

  const toggleRoadQualityView = () => {
    setRoadQualityView(prev => !prev);
    setVisibleLayers(prev => ({
      ...prev,
      roadQuality: !prev.roadQuality
    }));
    
    toast.info(roadQualityView ? 'Standard map view activated' : 'Road quality heatmap activated');
  };

  const handleRegionChange = (region: string) => {
    setMapRegion(region);
    
    const selectedCity = indianCities.find(city => city.name === region) || indianCities[0];
    
    setPosition({ 
      latitude: selectedCity.lat, 
      longitude: selectedCity.lng, 
      zoom: selectedCity.zoom 
    });
    
    setTimeout(() => addPotholeMarkers(), 500);
    toast.success(`Map region updated to ${region}`);
  };

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
    
    if (layer === 'potholes') {
      setMapMarkers(prev => 
        prev.map(marker => ({ 
          ...marker, 
          visible: marker.isUser ? true : !visibleLayers.potholes 
        }))
      );
    }
    
    toast.info(`${visibleLayers[layer] ? 'Hidden' : 'Showing'} ${layer} layer`);
  };

  const downloadMapData = () => {
    const mapData = {
      position,
      potholes: visibleLayers.potholes ? potholes : [],
      trafficDensity: visibleLayers.traffic ? trafficDensity : 0,
      roadQuality: visibleLayers.roadQuality,
      region: mapRegion
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "india-road-map-data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success("Map data downloaded successfully!");
  };

  // Show error when API key is missing
  if (!googleMapsApiKey) {
    return (
      <div className="p-4 border border-red-500 rounded-md bg-red-50 text-red-700">
        <h2 className="text-lg font-bold mb-2">Error: Map API Key Missing</h2>
        <p>Please provide a valid Map API key to load the map.</p>
      </div>
    );
  }

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
            >
              {(!mapLoaded || !mapsApiLoaded) && (
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
                    {loadError && (
                      <p className="text-red-400 text-sm mt-2">
                        Error: {loadError.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Simulated map rendering */}
              {mapLoaded && (
                <div className="h-full w-full bg-gray-100 relative">
                  {/* Base map layer - changes based on mapStyle */}
                  <div 
                    className={`absolute inset-0 ${mapStyle === 'satellite' ? 'bg-[url("/satellite-map-bg.jpg")]' : 'bg-[#f2f2f2]'}`}
                    style={{ 
                      backgroundImage: mapStyle === 'satellite' ? 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))' : '',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Map grid lines */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                      {Array.from({ length: 64 }).map((_, idx) => (
                        <div key={idx} className="border border-gray-300/20"></div>
                      ))}
                    </div>
                    
                    {/* Road Quality Overlay */}
                    {visibleLayers.roadQuality && (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-500/20 to-red-500/20"></div>
                    )}
                    
                    {/* Traffic Overlay */}
                    {visibleLayers.traffic && (
                      <TrafficOverlay density={trafficDensity} />
                    )}
                    
                    {/* Markers */}
                    {mapMarkers.filter(marker => marker.visible).map((marker) => (
                      <div 
                        key={marker.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ 
                          left: `${50 + (marker.position.lng - position.longitude) * 50}%`, 
                          top: `${50 - (marker.position.lat - position.latitude) * 50}%`
                        }}
                      >
                        <div 
                          className={`rounded-full ${marker.isUser ? 'h-4 w-4 border-2 border-white pulse-animation' : 'h-3 w-3'}`}
                          style={{ backgroundColor: marker.color }}
                        />
                        {/* For debugging - show marker title on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          {marker.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
              Map data © {new Date().getFullYear()} ROADSENSE AI | India Road Network
            </div>

            {mapLoaded && (
              <MapInfoPanel 
                roadDamageStats={roadDamageStats}
              />
            )}

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
                    {indianCities.map(city => (
                      <Button
                        key={city.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-normal"
                        onClick={() => handleRegionChange(city.name)}
                      >
                        {city.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

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

            <div className="absolute top-4 right-20 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString('en-IN')}
            </div>

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
                        pothole.severity === 'high' ? "bg-red-500" : 
                        pothole.severity === 'medium' ? "bg-yellow-500" : "bg-green-500"
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

