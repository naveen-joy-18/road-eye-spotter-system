
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { potholes } from '@/data/potholes';

interface RealTimeMapProps {
  onClose: () => void;
}

const RealTimeMap: React.FC<RealTimeMapProps> = ({ onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(link);

    // Import Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
    script.async = true;
    
    script.onload = () => {
      if (mapRef.current && window.L) {
        // Initialize map
        const L = window.L;
        mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);
        
        // Add random potholes around the world
        addPotholes(L);
        
        setLoading(false);
        toast.success("Real-time map loaded successfully");
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Clean up
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);
  
  const addPotholes = (L: any) => {
    // Add existing potholes from data
    potholes.forEach(pothole => {
      // Generate random coordinates near India
      const lat = 20.5937 + (Math.random() - 0.5) * 10;
      const lng = 78.9629 + (Math.random() - 0.5) * 10;
      
      const severityColor = pothole.severity === 'high' ? 'red' : 
                          pothole.severity === 'medium' ? 'orange' : 'green';
      
      const icon = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${severityColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      L.marker([lat, lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>Pothole:</b> ${pothole.address}<br><b>Severity:</b> ${pothole.severity}`);
    });
    
    // Add more random potholes globally
    for (let i = 0; i < 15; i++) {
      const lat = (Math.random() * 140) - 70;  // -70 to 70 (avoiding poles)
      const lng = (Math.random() * 340) - 170;  // -170 to 170
      
      // Random severity
      const severities = ['red', 'orange', 'green'];
      const severityColor = severities[Math.floor(Math.random() * severities.length)];
      
      const icon = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${severityColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      L.marker([lat, lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup("🚨 Pothole Detected!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl h-[80vh] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-gradient">Global Pothole Map</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        )}
        
        <div ref={mapRef} className="w-full h-[calc(80vh-60px)]"></div>
      </div>
    </div>
  );
};

export default RealTimeMap;
