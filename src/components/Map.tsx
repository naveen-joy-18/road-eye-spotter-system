import React, { useEffect, useRef, useState } from 'react';
import { MapPosition } from '@/types';
import PotholeMarker from './PotholeMarker';
import { potholes } from '@/data/potholes';
import { 
  Gauge, MapPin, Navigation, Search, Layers, 
  AlertCircle, LocateFixed, Eye, EyeOff, 
  Route, Download, Compass, Info, MapPinOff, Calendar,
  Box
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
import { generate3DMesh } from '@/services/meshGeneration';
import MapLayers from './map/MapLayers';
import RealTimeMap from './map/RealTimeMap';

interface MapProps {
  googleMapsApiKey?: string;
}

interface GlobalPotholeHotspot {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  address: string;
  reportedAt?: string;
  status?: string;
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
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('satellite'); // Default to satellite
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
  const [selectedPothole, setSelectedPothole] = useState<string | null>(null);
  const [generating3D, setGenerating3D] = useState<boolean>(false);
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showRealTimeMap, setShowRealTimeMap] = useState<boolean>(false);
  
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const loadingIntervalRef = useRef<number | null>(null);
  const compassIntervalRef = useRef<number | null>(null);
  
  const { isLoaded: mapsApiLoaded, loadError } = useGoogleMaps(googleMapsApiKey || '');

  const indianCities = [
    { name: "Global View", lat: 20, lng: 0, zoom: 2 },
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

  const globalPotholeHotspots: GlobalPotholeHotspot[] = [
    { id: "usa-1", lat: 40.7128, lng: -74.0060, severity: "medium", address: "New York City, USA" },
    { id: "usa-2", lat: 34.0522, lng: -118.2437, severity: "high", address: "Los Angeles, USA" },
    { id: "uk-1", lat: 51.5074, lng: -0.1278, severity: "low", address: "London, UK" },
    { id: "br-1", lat: -23.5505, lng: -46.6333, severity: "high", address: "São Paulo, Brazil" },
    { id: "au-1", lat: -33.8688, lng: 151.2093, severity: "medium", address: "Sydney, Australia" },
    { id: "ru-1", lat: 55.7558, lng: 37.6173, severity: "high", address: "Moscow, Russia" },
    { id: "jp-1", lat: 35.6762, lng: 139.6503, severity: "medium", address: "Tokyo, Japan" },
    { id: "ng-1", lat: 6.5244, lng: 3.3792, severity: "high", address: "Lagos, Nigeria" },
    { id: "eg-1", lat: 30.0444, lng: 31.2357, severity: "medium", address: "Cairo, Egypt" },
    { id: "za-1", lat: -26.2041, lng: 28.0473, severity: "low", address: "Johannesburg, South Africa" }
  ];

  useEffect(() => {
    if (!mapsApiLoaded || !mapRef.current) return;
    
    const interval = setInterval(() => {
      setMapProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setMapLoaded(true);
            setRoadDamageStats({
              total: potholes.length + globalPotholeHotspots.length,
              critical: [...potholes, ...globalPotholeHotspots].filter(p => p.severity === 'high').length,
              moderate: [...potholes, ...globalPotholeHotspots].filter(p => p.severity === 'medium').length,
              minor: [...potholes, ...globalPotholeHotspots].filter(p => p.severity === 'low').length
            });
            
            setPosition({
              latitude: 20,
              longitude: 0,
              zoom: 2
            });
            setMapRegion("Global View");
            
            addPotholeMarkers(true);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 150);
    loadingIntervalRef.current = interval as unknown as number;

    const compassInterval = setInterval(() => {
      setCompassHeading(prev => (prev + 1) % 360);
    }, 100);
    compassIntervalRef.current = compassInterval as unknown as number;
    
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

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      
      if (compassIntervalRef.current) {
        clearInterval(compassIntervalRef.current);
        compassIntervalRef.current = null;
      }
      
      setMapMarkers([]);
    };
  }, []);

  useEffect(() => {
    if (loadError) {
      toast.error(`Failed to load Map API: ${loadError.message}`);
      console.error("Map API loading error:", loadError);
    }
  }, [loadError]);

  const addPotholeMarkers = (isGlobal = false) => {
    try {
      const markersToUse = isGlobal || mapRegion === "Global View" ? 
        [...potholes, ...globalPotholeHotspots] : potholes;
      
      const newMarkers = markersToUse.map(pothole => {
        const lat = isGlobal ? 
          (pothole as any).lat || position.latitude + (Math.random() - 0.5) * (isGlobal ? 10 : 0.05) : 
          position.latitude + (Math.random() - 0.5) * 0.05;
        
        const lng = isGlobal ? 
          (pothole as any).lng || position.longitude + (Math.random() - 0.5) * (isGlobal ? 20 : 0.05) : 
          position.longitude + (Math.random() - 0.5) * 0.05;
        
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
            reportedAt: (pothole as any).reportedAt || new Date().toISOString(),
            status: (pothole as any).status || 'active',
            imageUrl: (pothole as any).imageUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Fly_Agaric_mushroom_05.jpg/576px-Fly_Agaric_mushroom_05.jpg"
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
    
    setTimeout(() => addPotholeMarkers(region === "Global View"), 500);
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

  const handleGenerate3DMesh = async (markerId: string) => {
    try {
      setSelectedPothole(markerId);
      setGenerating3D(true);
      
      const marker = mapMarkers.find(m => m.id === markerId);
      if (!marker) {
        toast.error("Could not find selected pothole data");
        setGenerating3D(false);
        return;
      }
      
      toast.info("Generating 3D model of pothole...", {
        description: "This may take a few moments"
      });
      
      const result = await generate3DMesh(marker.info.imageUrl);
      
      if (result.success) {
        setMeshUrl(result.url);
        toast.success("3D model generated successfully!", {
          description: "View the 3D model in the visualization tab"
        });
      } else {
        toast.error("Failed to generate 3D model", {
          description: result.error || "Unknown error occurred"
        });
      }
    } catch (error) {
      console.error("3D generation error:", error);
      toast.error("Failed to generate 3D model");
    } finally {
      setGenerating3D(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    toast.info(`Searching for "${searchTerm}"...`);
    
    setTimeout(() => {
      const results = potholes.filter(p => 
        p.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (results.length > 0) {
        toast.success(`Found ${results.length} matching results`);
        setSelectedPothole(results[0].id);
      } else {
        toast.error("No matching potholes found");
      }
    }, 1000);
  };

  const handleShowRealMap = () => {
    setShowRealTimeMap(true);
    toast.info("Opening real-time global pothole map");
  };

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
      <h1 className="futuristic-heading text-gradient text-2xl mb-2">POTHOLE DETECTION & MAPPING</h1>
      <Tabs value={mapTabView} onValueChange={setMapTabView} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 font-futuristic">
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
          <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-blue-900/30 glow-effect">
            <div 
              ref={mapRef} 
              className="absolute inset-0 bg-gray-900 transition-all duration-500"
            >
              {(!mapLoaded || !mapsApiLoaded) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-white mt-4 font-futuristic tracking-wider">Loading Global Pothole Network...</p>
                    <div className="w-64 h-2 bg-gray-700 rounded-full mt-4">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${mapProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-white/70 text-sm mt-2 font-futuristic">
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
              
              {mapLoaded && (
                <div className="h-full w-full relative">
                  <div 
                    className={`absolute inset-0 ${
                      mapStyle === 'satellite' 
                        ? 'bg-[url("https://i.imgur.com/WBDTL5C.jpg")]' 
                        : 'bg-[#0a0b10]'
                    }`}
                    style={{ 
                      backgroundImage: mapStyle === 'satellite' 
                        ? 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("https://i.imgur.com/WBDTL5C.jpg")' 
                        : '',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-8">
                      {Array.from({ length: 96 }).map((_, idx) => (
                        <div key={idx} className="border border-blue-900/10"></div>
                      ))}
                    </div>

                    {mapRegion === "Global View" && mapStyle !== 'satellite' && (
                      <>
                        <div className="absolute top-[20%] left-[15%] w-[20%] h-[30%] bg-gray-800/50 rounded-full blur-md"></div>
                        <div className="absolute top-[15%] left-[40%] w-[30%] h-[25%] bg-gray-800/50 rounded-full blur-md"></div>
                        <div className="absolute top-[50%] left-[65%] w-[15%] h-[20%] bg-gray-800/50 rounded-full blur-md"></div>
                        <div className="absolute top-[60%] left-[15%] w-[15%] h-[15%] bg-gray-800/50 rounded-full blur-md"></div>
                        <div className="absolute inset-0 bg-blue-900/5"></div>
                      </>
                    )}
                    
                    {mapRegion.includes("India") && mapRegion !== "Global View" && mapStyle !== 'satellite' && (
                      <div className="absolute top-[30%] left-[35%] w-[30%] h-[40%] bg-gray-800/50 rounded-lg blur-md"></div>
                    )}
                    
                    {visibleLayers.roadQuality && (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-500/20 to-red-500/20 mix-blend-overlay"></div>
                    )}
                    
                    {visibleLayers.traffic && (
                      <TrafficOverlay density={trafficDensity} />
                    )}
                    
                    {mapRegion === "Global View" && (
                      <>
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/20"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blue-500/20"></div>
                      </>
                    )}
                    
                    {mapRegion === "Global View" && (
                      <div className="absolute inset-0">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div key={`lat-${idx}`} className="absolute left-0 right-0 h-px bg-blue-500/10"
                               style={{ top: `${(idx + 1) * 100 / 7}%` }}></div>
                        ))}
                        {Array.from({ length: 11 }).map((_, idx) => (
                          <div key={`long-${idx}`} className="absolute top-0 bottom-0 w-px bg-blue-500/10"
                               style={{ left: `${(idx + 1) * 100 / 12}%` }}></div>
                        ))}
                      </div>
                    )}
                    
                    {mapMarkers.filter(marker => marker.visible).map((marker) => (
                      <div 
                        key={marker.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ 
                          left: `${50 + (marker.position.lng - position.longitude) * (mapRegion === "Global View" ? 2.5 : 50)}%`, 
                          top: `${50 - (marker.position.lat - position.latitude) * (mapRegion === "Global View" ? 5 : 50)}%`
                        }}
                        onClick={() => setSelectedPothole(marker.id)}
                      >
                        <div 
                          className={`rounded-full ${marker.isUser ? 'h-4 w-4 border-2 border-white animate-pulse' : 'h-3 w-3 animate-pulse-glow'} ${selectedPothole === marker.id ? 'ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: marker.color }}
                        />
                        {selectedPothole === marker.id && marker.info.imageUrl && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="absolute -right-8 -bottom-8 h-6 w-6 rounded-full bg-primary/80 hover:bg-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerate3DMesh(marker.id);
                            }}
                            disabled={generating3D}
                          >
                            <Box className="h-3 w-3 text-white" />
                          </Button>
                        )}
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

            <div className="absolute top-4 left-4 w-64 z-20">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search global pothole database..." 
                    className="glass-panel pl-8 pr-4 py-2 w-full rounded-md shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-primary font-futuristic text-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <div className="absolute bottom-20 left-4 right-4 neo-glass p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-futuristic">Traffic Density</span>
                <span className="text-sm font-futuristic">{trafficDensity}%</span>
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
              <div className="absolute bottom-4 left-4 neo-glass p-3 rounded-full shadow-md glow-effect">
                <Gauge className="h-5 w-5 text-primary" />
                <div className="text-sm font-futuristic">{speedLimit} km/h</div>
              </div>
            )}

            <div 
              className="absolute bottom-4 right-4 neo-glass p-2 rounded-full shadow-md glow-effect"
              style={{ transform: `rotate(${compassHeading}deg)` }}
            >
              <Navigation className="h-6 w-6 text-primary" />
            </div>
            
            <div className="absolute bottom-16 right-2 text-xs text-gray-400 bg-black/40 px-2 py-1 rounded font-futuristic tracking-wide">
              Map data © {new Date().getFullYear()} ROADSENSE AI | Global Pothole Network
            </div>

            {mapLoaded && (
              <MapInfoPanel 
                roadDamageStats={roadDamageStats}
              />
            )}

            <div className="absolute top-16 left-4 neo-glass p-3 rounded-md shadow-md z-20">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start neo-glass font-futuristic">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-foreground">{mapRegion}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-48 neo-glass">
                  <div className="p-1">
                    {indianCities.map(city => (
                      <Button
                        key={city.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-futuristic tracking-wide text-foreground"
                        onClick={() => handleRegionChange(city.name)}
                      >
                        {city.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <MapLayers 
              visibleLayers={visibleLayers}
              toggleLayer={toggleLayer}
              toggleRoadQualityView={toggleRoadQualityView}
              downloadMapData={downloadMapData}
              mapStyle={mapStyle}
              setMapStyle={setMapStyle}
              showRealMap={handleShowRealMap}
            />

            <div className="absolute top-4 right-20 neo-glass px-2 py-1 rounded text-xs flex items-center font-futuristic">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString('en-IN')}
            </div>

            <MapLegend />
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="mt-4">
          <div className="neo-glass p-6 rounded-lg border border-blue-900/20 min-h-[400px] text-foreground">
            <h2 className="futuristic-heading text-2xl mb-4 text-gradient">TRAFFIC ANALYSIS DASHBOARD</h2>
            <p className="elegant-text text-muted-foreground mb-6">Analyze traffic patterns and congestion levels across the global road network</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="text-lg font-medium mb-2">Current Traffic Status</h3>
                <div className="flex justify-between items-center">
                  <span>Overall Density:</span>
                  <Badge className="bg-amber-500 hover:bg-amber-600">{trafficDensity}%</Badge>
                </div>
                <div className="h-8 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ 
                      width: `${trafficDensity}%`,
                      backgroundColor: trafficDensity > 75 ? '#ef4444' : 
                                      trafficDensity > 50 ? '#f97316' : 
                                      trafficDensity > 25 ? '#eab308' : '#22c55e'
                    }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {trafficDensity > 75 ? 'Heavy congestion detected' : 
                  trafficDensity > 50 ? 'Moderate traffic in major areas' : 
                  trafficDensity > 25 ? 'Light traffic conditions' : 'Free flowing traffic'}
                </p>
              </div>
              
              <div className="bg-card p-4 rounded-lg border border-border">
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>City: 20-40</span>
                  <span>Highway: 60-80</span>
                  <span>Expressway: 100+</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
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
              
              <div className="h-40 bg-muted rounded-lg mt-4 flex items-end p-4 gap-1">
                <div className="flex-1 h-[30%] bg-primary/40 rounded-t-md"></div>
                <div className="flex-1 h-[45%] bg-primary/60 rounded-t-md"></div>
                <div className="flex-1 h-[20%] bg-primary/30 rounded-t-md"></div>
                <div className="flex-1 h-[60%] bg-primary/70 rounded-t-md"></div>
                <div className="flex-1 h-[35%] bg-primary/50 rounded-t-md"></div>
                <div className="flex-1 h-[25%] bg-primary/40 rounded-t-md"></div>
                <div className="flex-1 h-[40%] bg-primary/60 rounded-t-md"></div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="neo-glass p-6 rounded-lg border border-blue-900/20 min-h-[400px]">
            <h2 className="futuristic-heading text-2xl mb-4 text-gradient">ROAD DAMAGE STATISTICS</h2>
            <p className="elegant-text text-muted-foreground mb-6">Comprehensive analytics of road surface damage across regions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card p-4 rounded-lg border border-border flex flex-col items-center">
                <div className="text-4xl font-bold text-red-500 mb-2">{roadDamageStats.critical}</div>
                <div className="text-muted-foreground text-sm">Critical Damages</div>
                <div className="text-xs mt-1 text-red-400">Needs Immediate Repair</div>
              </div>
              
              <div className="bg-card p-4 rounded-lg border border-border flex flex-col items-center">
                <div className="text-4xl font-bold text-amber-500 mb-2">{roadDamageStats.moderate}</div>
                <div className="text-muted-foreground text-sm">Moderate Damages</div>
                <div className="text-xs mt-1 text-amber-400">Scheduled Repairs</div>
              </div>
              
              <div className="bg-card p-4 rounded-lg border border-border flex flex-col items-center">
                <div className="text-4xl font-bold text-green-500 mb-2">{roadDamageStats.minor}</div>
                <div className="text-muted-foreground text-sm">Minor Damages</div>
                <div className="text-xs mt-1 text-green-400">Monitoring Required</div>
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-4">Regional Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between">
                    <span>Delhi Region</span>
                    <span>24 reports</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span>Mumbai Region</span>
                    <span>18 reports</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span>Bangalore Region</span>
                    <span>12 reports</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Real-time map modal */}
      {showRealTimeMap && <RealTimeMap onClose={() => setShowRealTimeMap(false)} />}
    </div>
  );
};

export default Map;
