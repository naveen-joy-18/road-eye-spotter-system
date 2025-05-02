
import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Add type definition for Leaflet and plugins
declare global {
  interface Window {
    L: any;
    turf: any;
  }
}

interface IndiaHeatmapViewProps {
  onClose: () => void;
}

const IndiaHeatmapView: React.FC<IndiaHeatmapViewProps> = ({ onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(link);

    // Import Leaflet JS
    const scriptLeaflet = document.createElement('script');
    scriptLeaflet.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
    scriptLeaflet.async = true;
    document.body.appendChild(scriptLeaflet);

    // Import Heatmap Plugin
    const scriptHeat = document.createElement('script');
    scriptHeat.src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
    scriptHeat.async = true;
    document.body.appendChild(scriptHeat);

    // Import Turf.js
    const scriptTurf = document.createElement('script');
    scriptTurf.src = 'https://unpkg.com/@turf/turf@6/turf.min.js';
    scriptTurf.async = true;
    document.body.appendChild(scriptTurf);

    // Initialize map after scripts are loaded
    scriptTurf.onload = () => {
      initializeMap();
    };

    return () => {
      // Clean up
      document.head.removeChild(link);
      document.body.removeChild(scriptLeaflet);
      document.body.removeChild(scriptHeat);
      document.body.removeChild(scriptTurf);
    };
  }, []);

  const initializeMap = () => {
    if (mapRef.current && window.L) {
      const L = window.L;
      const map = L.map(mapRef.current).setView([22.9734, 78.6569], 5);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Define red icon for pothole markers
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const potholeLocations = [];

      // Major Indian cities for generating random pothole locations
      const cityCenters = [
        [28.7041, 77.1025], // Delhi
        [19.0760, 72.8777], // Mumbai
        [12.9716, 77.5946], // Bangalore
        [13.0827, 80.2707], // Chennai
        [22.7196, 75.8577], // Indore
        [26.8467, 80.9462], // Lucknow
        [17.3850, 78.4867], // Hyderabad
        [23.0225, 72.5714], // Ahmedabad
        [25.3176, 82.9739], // Varanasi
        [10.8505, 76.2711], // Kerala region
        [30.7333, 76.7794], // Chandigarh
        [15.2993, 74.1240], // Goa
        [21.1702, 72.8311], // Surat
        [24.5854, 73.7125], // Udaipur
        [11.0168, 76.9558]  // Coimbatore
      ];

      // Generate 300 random pothole markers
      for (let i = 0; i < 300; i++) {
        const city = cityCenters[Math.floor(Math.random() * cityCenters.length)];
        const lat = city[0] + (Math.random() - 0.5) * 0.5; // ±0.25 degrees
        const lon = city[1] + (Math.random() - 0.5) * 0.5;

        potholeLocations.push([lat, lon]);

        L.marker([lat, lon], { icon: redIcon })
          .addTo(map)
          .bindPopup(`🚨 Pothole #${i + 1}`);
      }

      // Add heatmap layer
      const heat = L.heatLayer(potholeLocations, {
        radius: 20,
        blur: 15,
        maxZoom: 10
      }).addTo(map);

      // Load district boundaries GeoJSON
      fetch('https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson')
        .then(response => response.json())
        .then(districtData => {
          try {
            if (window.turf) {
              // For each district, count the number of potholes within its boundaries
              districtData.features.forEach(district => {
                if (!district.geometry) return;
                
                const districtPolygon = district.geometry;
                let count = 0;

                potholeLocations.forEach(location => {
                  try {
                    const point = window.turf.point([location[1], location[0]]); // [lng, lat]
                    if (window.turf.booleanPointInPolygon(point, districtPolygon)) {
                      count++;
                    }
                  } catch (e) {
                    // Skip problematic points
                    console.error("Error processing point:", e);
                  }
                });

                // Add the count to the district's properties
                district.properties.potholeCount = count;
              });
            }

            // Add district boundaries to the map with popups showing pothole counts
            L.geoJSON(districtData, {
              style: {
                color: '#555',
                weight: 1,
                fillOpacity: 0.1
              },
              onEachFeature: function (feature, layer) {
                const name = feature.properties.DISTRICT || feature.properties.district || 'Unknown';
                const count = feature.properties.potholeCount || 0;
                layer.bindPopup(`<strong>${name}</strong><br>Potholes: ${count}`);
              }
            }).addTo(map);
            
            setLoading(false);
            toast.success("India pothole heatmap loaded successfully");
          } catch (error) {
            console.error('Error processing district data:', error);
            setLoading(false);
            toast.error("Error processing district data");
          }
        })
        .catch(error => {
          console.error('Error loading district GeoJSON:', error);
          setLoading(false);
          toast.error("Failed to load district boundaries");
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl h-[85vh] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-gradient">🚧 India Pothole Heatmap with District Counts</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Loading heatmap data...</p>
            </div>
          </div>
        )}
        
        <div ref={mapRef} className="w-full h-[calc(85vh-60px)]"></div>
      </div>
    </div>
  );
};

export default IndiaHeatmapView;
