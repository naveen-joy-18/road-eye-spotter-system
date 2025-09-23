// Real-time YOLO Detection Component
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Camera, 
  Square, 
  Play, 
  Pause, 
  AlertTriangle, 
  MapPin, 
  Download,
  Settings,
  Zap
} from 'lucide-react';
import { yoloService } from '@/services/yoloDetection';
import { gpsService } from '@/services/gpsService';
import { reportingService, PotholeReport } from '@/services/reportingService';
import { PotholeDetection } from '@/types';
import { toast } from 'sonner';
import { speakAlertWithSeverity } from '@/utils/voiceAlert';

interface RealTimeDetectionProps {
  onDetection?: (detection: PotholeDetection) => void;
  onReportCreated?: (report: PotholeReport) => void;
}

const RealTimeDetection: React.FC<RealTimeDetectionProps> = ({
  onDetection,
  onReportCreated
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [currentDetections, setCurrentDetections] = useState<PotholeDetection[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [detectionCount, setDetectionCount] = useState(0);
  const [fps, setFps] = useState(10);
  const [lastReport, setLastReport] = useState<PotholeReport | null>(null);
  const [isGPSEnabled, setIsGPSEnabled] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Check GPS availability
    checkGPSAvailability();
    
    // Load YOLO model on component mount
    loadModel();

    return () => {
      stopDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkGPSAvailability = async () => {
    const available = await gpsService.requestPermission();
    setIsGPSEnabled(available);
    
    if (available) {
      gpsService.startWatching(
        (coordinates) => {
          console.log('[GPS] Position updated:', coordinates);
        },
        (error) => {
          console.error('[GPS] Error:', error);
          setIsGPSEnabled(false);
        }
      );
    }
  };

  const loadModel = async () => {
    try {
      setModelLoadingProgress(0);
      
      // Simulate model loading progress
      const progressInterval = setInterval(() => {
        setModelLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const success = await yoloService.loadModel();
      
      clearInterval(progressInterval);
      setModelLoadingProgress(100);
      setIsModelLoaded(success);
      
      if (success) {
        toast.success('YOLO model loaded successfully');
      } else {
        toast.error('Failed to load YOLO model. Check if yolo8n.pt is in public/models/');
      }
    } catch (error) {
      console.error('Model loading error:', error);
      toast.error('Error loading YOLO model');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Prefer back camera
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        toast.success('Camera started successfully');
        return true;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Failed to access camera. Please check permissions.');
      return false;
    }
  };

  const startDetection = async () => {
    if (!isModelLoaded) {
      toast.error('YOLO model not loaded yet');
      return;
    }

    const cameraStarted = await startCamera();
    if (!cameraStarted || !videoRef.current) return;

    setIsDetecting(true);
    setDetectionCount(0);
    
    try {
      detectionStopRef.current = await yoloService.processVideoStream(
        videoRef.current,
        async (detections) => {
          setCurrentDetections(detections);
          setDetectionCount(prev => prev + detections.length);
          
          // Process each detection
          for (const detection of detections) {
            // Trigger callback
            if (onDetection) {
              onDetection(detection);
            }
            
            // Play voice alert
            speakAlertWithSeverity(
              `${detection.severity} pothole detected ${detection.distance} meters ahead`,
              detection.severity
            );
            
            // Create report automatically
            if (isGPSEnabled) {
              try {
                const report = await reportingService.createReport(detection, 'automatic');
                await reportingService.saveReportToFile(report);
                setLastReport(report);
                
                if (onReportCreated) {
                  onReportCreated(report);
                }
                
                toast.success(`Pothole report created: ${report.id.substring(0, 8)}...`);
              } catch (error) {
                console.error('Failed to create report:', error);
              }
            }
          }
          
          // Draw detection boxes on canvas
          drawDetections(detections);
        },
        { fps, confidenceThreshold }
      );
      
      toast.info('Real-time detection started');
    } catch (error) {
      console.error('Detection error:', error);
      toast.error('Failed to start detection');
      setIsDetecting(false);
    }
  };

  const stopDetection = () => {
    if (detectionStopRef.current) {
      detectionStopRef.current();
      detectionStopRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsDetecting(false);
    setCurrentDetections([]);
    gpsService.stopWatching();
    
    toast.info('Detection stopped');
  };

  const drawDetections = (detections: PotholeDetection[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detection boxes
    detections.forEach(detection => {
      if (!detection.boundingBox) return;
      
      const { x, y, width, height } = detection.boundingBox;
      
      // Set color based on severity
      const colors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
      };
      
      ctx.strokeStyle = colors[detection.severity];
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      ctx.fillStyle = colors[detection.severity];
      ctx.font = '16px Arial';
      const label = `${detection.severity.toUpperCase()} (${(detection.confidence * 100).toFixed(1)}%)`;
      ctx.fillText(label, x, y - 10);
    });
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Camera Feed */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Real-time Detection
              {isDetecting && <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg"
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-64 pointer-events-none"
              />
              
              {!isModelLoaded && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <div className="mb-4">
                      <Zap className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <p>Loading YOLO Model...</p>
                    </div>
                    <Progress value={modelLoadingProgress} className="w-48" />
                    <p className="text-sm mt-2">{modelLoadingProgress.toFixed(0)}%</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={isDetecting ? stopDetection : startDetection}
                disabled={!isModelLoaded}
                className={isDetecting ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {isDetecting ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Detection
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Detection
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={loadModel}
                disabled={isDetecting}
              >
                Reload Model
              </Button>
            </div>

            {!isGPSEnabled && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  GPS is not available. Reports will be created without location data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls & Status */}
      <div className="lg:col-span-1 space-y-6">
        {/* Detection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Confidence Threshold</label>
              <Slider
                value={[confidenceThreshold]}
                onValueChange={([value]) => setConfidenceThreshold(value)}
                min={0.1}
                max={1.0}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">
                {(confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            
            <div>
              <label className="text-sm font-medium">Detection FPS</label>
              <Slider
                value={[fps]}
                onValueChange={([value]) => setFps(value)}
                min={1}
                max={30}
                step={1}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{fps} FPS</span>
            </div>
          </CardContent>
        </Card>

        {/* Detection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Model Status:</span>
                <Badge variant={isModelLoaded ? "default" : "destructive"}>
                  {isModelLoaded ? "Loaded" : "Not Loaded"}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">GPS Status:</span>
                <Badge variant={isGPSEnabled ? "default" : "secondary"}>
                  {isGPSEnabled ? "Active" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Total Detections:</span>
                <Badge variant="outline">{detectionCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Detections */}
        <Card>
          <CardHeader>
            <CardTitle>Live Detections</CardTitle>
          </CardHeader>
          <CardContent>
            {currentDetections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No detections in current frame
              </p>
            ) : (
              <div className="space-y-2">
                {currentDetections.map((detection, index) => (
                  <div key={index} className="p-2 border border-border rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(detection.severity)}>
                        {detection.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs">
                      Distance: {detection.distance}m | Depth: {detection.depthEstimate}cm
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Report */}
        {lastReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Latest Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Report ID: {lastReport.id.substring(0, 12)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  {lastReport.location.roadName || 'Unknown Road'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reportingService.downloadReport(lastReport)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RealTimeDetection;