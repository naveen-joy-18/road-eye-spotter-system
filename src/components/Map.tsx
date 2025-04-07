
import React, { useEffect, useRef, useState } from 'react';
import { MapPosition } from '@/types';
import PotholeMarker from './PotholeMarker';
import { potholes } from '@/data/potholes';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MapPosition>({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 13
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // In a real implementation, this would use a map library like Leaflet or Google Maps
    // For now, we'll simulate a map with a basic div
    if (mapRef.current) {
      setTimeout(() => {
        setMapLoaded(true);
      }, 1000);
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

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
      <div 
        ref={mapRef} 
        className="absolute inset-0 bg-gray-200"
        style={{
          backgroundImage: 'url("https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-122.4194,37.7749,13,0/600x600?access_token=placeholder")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Map markers */}
        {mapLoaded && potholes.map((pothole) => (
          <PotholeMarker key={pothole.id} pothole={pothole} />
        ))}

        {/* User location marker */}
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
          </div>
        )}
      </div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="bg-white shadow-md hover:bg-gray-100"
          onClick={getUserLocation}
        >
          <MapPin className="h-5 w-5 text-primary" />
        </Button>
      </div>
      
      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
        Map data © {new Date().getFullYear()} Contributors
      </div>
    </div>
  );
};

export default Map;
