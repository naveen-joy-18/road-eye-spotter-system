// Map View Component with Pothole Markers
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Download, Trash2, RefreshCw } from 'lucide-react';
import { PotholeReport, reportingService } from '@/services/reportingService';
import { gpsService } from '@/services/gpsService';
import { toast } from 'sonner';

interface MapViewProps {
  reports?: PotholeReport[];
  onReportClick?: (report: PotholeReport) => void;
}

const MapView: React.FC<MapViewProps> = ({ reports = [], onReportClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [allReports, setAllReports] = useState<PotholeReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PotholeReport | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapApiKey, setMapApiKey] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Load reports from reporting service
    setAllReports(reportingService.getAllReports());
    
    // Get current location
    getCurrentLocation();
  }, [reports]);

  const getCurrentLocation = async () => {
    try {
      const coordinates = await gpsService.getCurrentPosition();
      setCurrentLocation({
        lat: coordinates.latitude,
        lng: coordinates.longitude
      });
    } catch (error) {
      console.error('Failed to get current location:', error);
      // Use default location (example: New Delhi, India)
      setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
    }
  };

  const loadMap = () => {
    if (!mapApiKey.trim()) {
      toast.error('Please enter a valid Google Maps API key');
      return;
    }

    // Initialize Google Maps (placeholder implementation)
    // In real implementation, you would load Google Maps API here
    setIsMapLoaded(true);
    toast.success('Map loaded successfully');
  };

  const downloadAllReports = () => {
    reportingService.downloadAllReports();
    toast.success('Reports downloaded successfully');
  };

  const clearAllReports = () => {
    reportingService.clearAllReports();
    setAllReports([]);
    setSelectedReport(null);
    toast.info('All reports cleared');
  };

  const refreshReports = () => {
    setAllReports(reportingService.getAllReports());
    toast.info('Reports refreshed');
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Container */}
      <div className="lg:col-span-2">
        <Card className="h-[600px]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pothole Locations Map
            </CardTitle>
            
            {!isMapLoaded && (
              <div className="space-y-3">
                <Input
                  placeholder="Enter Google Maps API Key"
                  value={mapApiKey}
                  onChange={(e) => setMapApiKey(e.target.value)}
                  type="password"
                />
                <Button onClick={loadMap} disabled={!mapApiKey.trim()}>
                  Load Map
                </Button>
                <p className="text-sm text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="h-full">
            {isMapLoaded ? (
              <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground">
                    Map with {allReports.length} pothole markers would display here
                  </p>
                  <div className="mt-4 space-y-2">
                    {currentLocation && (
                      <p className="text-sm">
                        Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Map Not Loaded</h3>
                  <p className="text-muted-foreground">
                    Enter your Google Maps API key to view pothole locations
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports Panel */}
      <div className="lg:col-span-1">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Detected Potholes</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={refreshReports}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={downloadAllReports}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={clearAllReports}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {allReports.length} reports found
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            {allReports.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pothole reports yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start video analysis to detect potholes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedReport(report);
                      if (onReportClick) onReportClick(report);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        className={getSeverityColor(report.detection.severity)}
                      >
                        {report.detection.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(report.timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {report.location.roadName || 'Unknown Road'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.location.city}, {report.location.state}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Confidence: {(report.detection.confidence * 100).toFixed(1)}%</span>
                        <span>Depth: {report.detection.depthEstimate}cm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Report Details */}
      {selectedReport && (
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Detection Info</h4>
                  <div className="space-y-1 text-sm">
                    <p>ID: {selectedReport.id}</p>
                    <p>Severity: {selectedReport.detection.severity}</p>
                    <p>Confidence: {(selectedReport.detection.confidence * 100).toFixed(1)}%</p>
                    <p>Algorithm: {selectedReport.detection.detectionAlgorithm}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Physical Properties</h4>
                  <div className="space-y-1 text-sm">
                    <p>Depth: {selectedReport.detection.depthEstimate}cm</p>
                    <p>Surface Damage: {selectedReport.detection.surfaceDamageEstimate}%</p>
                    <p>Size: {selectedReport.detection.size}</p>
                    <p>Distance: {selectedReport.detection.distance}m</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <div className="space-y-1 text-sm">
                    <p>Lat: {selectedReport.location.coordinates.latitude.toFixed(6)}</p>
                    <p>Lng: {selectedReport.location.coordinates.longitude.toFixed(6)}</p>
                    <p>Road: {selectedReport.location.roadName || 'Unknown'}</p>
                    <p>City: {selectedReport.location.city || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => reportingService.downloadReport(selectedReport)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;