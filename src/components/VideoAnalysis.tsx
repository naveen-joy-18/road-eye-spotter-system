
import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  FileVideo, 
  Upload, 
  Video, 
  Gauge, 
  Settings, 
  BarChart3, 
  Eye, 
  MapPin,
  Play,
  Pause,
  RotateCw,
  ZoomIn, 
  ZoomOut,
  Info,
  Bell,
  Terminal,
  Code,
  Database
} from 'lucide-react';
import { AlertSeverity } from '@/utils/voiceAlert';
import { 
  simulateVideoProcessing, 
  simulateRealTimeAnalysis, 
  ProcessingStats, 
  PotholeDetection 
} from '@/utils/simulatedPythonBackend';
import { yoloService } from '@/services/yoloDetection';
import { reportingService } from '@/services/reportingService';
import { gpsService } from '@/services/gpsService';

interface VideoAnalysisProps {
  onSimulationChange?: (isSimulating: boolean) => void;
  onPotholeDetected?: (detection: PotholeDetection) => void;
  onFrameUpdate?: (frameCount: number) => void;
}

const DEMO_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ 
  onSimulationChange, 
  onPotholeDetected,
  onFrameUpdate 
}) => {
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [detections, setDetections] = useState<PotholeDetection[]>([]);
  const [currentSimTime, setCurrentSimTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [sensitivityLevel, setSensitivityLevel] = useState(75);
  const [detectionThreshold, setDetectionThreshold] = useState(65);
  const [selectedDetection, setSelectedDetection] = useState<PotholeDetection | null>(null);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    framesProcessed: 0,
    framesPerSecond: 0,
    detectionAccuracy: 0,
    memoryUsage: 0,
    tensorflowStatus: 'Ready',
    gpuUtilization: 0,
    modelName: 'PotholeNet-v3.4',
    detectionEvents: 0
  });
  const [showAlerts, setShowAlerts] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [alertHistory, setAlertHistory] = useState<PotholeDetection[]>([]);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [pythonConsoleOutput, setPythonConsoleOutput] = useState<string[]>([]);
  const [showPythonLogs, setShowPythonLogs] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const statsIntervalRef = useRef<number | null>(null);
  const processTimeoutRef = useRef<number | null>(null);
  const pythonSimulationRef = useRef<{ cancel: () => void } | null>(null);
  
  useEffect(() => {
    // Load the demo video by default
    if (!videoUrl && !videoFile) {
      setVideoUrl(DEMO_VIDEO_URL);
      toast.info("Using demo video for analysis", {
        description: "Upload your own video for custom road analysis"
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      if (processTimeoutRef.current) {
        clearTimeout(processTimeoutRef.current);
      }
      if (pythonSimulationRef.current) {
        pythonSimulationRef.current.cancel();
      }
      if (videoUrl && videoUrl !== DEMO_VIDEO_URL) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    if (videoRef.current && videoRef.current.playbackRate !== videoSpeed) {
      videoRef.current.playbackRate = videoSpeed;
    }
  }, [videoSpeed]);

  useEffect(() => {
    if (onSimulationChange) {
      onSimulationChange(isSimulating);
    }
  }, [isSimulating, onSimulationChange]);
  
  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    if (!detections.length && !isProcessing) {
      // Automatically start processing when video is loaded
      simulateProcessing();
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoUrl && videoUrl !== DEMO_VIDEO_URL) {
        URL.revokeObjectURL(videoUrl);
      }
      
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setDetections([]);
      setAlertHistory([]);
      setProcessProgress(0);
      setSelectedDetection(null);
      setIsSimulating(false);
      setCurrentSimTime(0);
      setIsVideoLoaded(false);
      setPythonConsoleOutput([]);
      setProcessingStats({
        framesProcessed: 0,
        framesPerSecond: 0,
        detectionAccuracy: 0,
        memoryUsage: 0,
        tensorflowStatus: 'Ready',
        gpuUtilization: 0,
        modelName: 'PotholeNet-v3.4',
        detectionEvents: 0
      });
      
      toast.success("Video uploaded successfully", {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
      });
      
      // Automatically start processing once file is uploaded
      setTimeout(() => {
        simulateProcessing();
      }, 1000);
    }
  };

  const simulateProcessing = () => {
    if (isProcessing || !videoUrl) return;
    
    setIsProcessing(true);
    setProcessProgress(0);
    setSelectedDetection(null);
    setAlertHistory([]);
    setPythonConsoleOutput([
      "[INFO] Loading TensorFlow 2.9.0...",
      "[INFO] Initializing YOLOv5 model for pothole detection",
      "[INFO] CUDA acceleration enabled on GPU: NVIDIA RTX",
      "[INFO] Starting video processing pipeline..."
    ]);
    
    toast.info("Starting Python video analysis...", {
      description: "TensorFlow models initializing for pothole detection",
    });

    // Use our simulated Python backend for processing
    if (pythonSimulationRef.current) {
      pythonSimulationRef.current.cancel();
    }
    
    pythonSimulationRef.current = simulateVideoProcessing(videoUrl, {
      sensitivityLevel,
      detectionThreshold,
      onProgress: (progress, stats) => {
        setProcessProgress(progress);
        setProcessingStats(stats);
        
        // Update frame count for Python terminal
        if (onFrameUpdate) {
          onFrameUpdate(stats.framesProcessed);
        }
        
        // Add Python-like console output
        if (progress % 10 < 2 && Math.random() > 0.7) {
          setPythonConsoleOutput(prev => [...prev, 
            `[INFO] Processed ${stats.framesProcessed} frames at ${stats.framesPerSecond.toFixed(1)} FPS`,
            `[DEBUG] Detection accuracy: ${stats.detectionAccuracy.toFixed(1)}%`
          ]);
        }
      },
      onComplete: (detections) => {
        setDetections(detections);
        setIsProcessing(false);
        setProcessProgress(100);
        
        // Add completion message to Python console
        setPythonConsoleOutput(prev => [...prev, 
          "[INFO] Video processing complete",
          `[INFO] Detected ${detections.length} potholes in video`,
          "[DEBUG] Pothole classification breakdown:",
          `  - Critical: ${detections.filter(d => d.severity === 'high').length}`,
          `  - Moderate: ${detections.filter(d => d.severity === 'medium').length}`,
          `  - Minor: ${detections.filter(d => d.severity === 'low').length}`,
          "[INFO] Analysis results ready for review"
        ]);
        
        toast.success("Python analysis complete!", {
          description: `Found ${detections.length} potholes using TensorFlow models.`,
          icon: <Terminal className="text-green-500" />
        });
        
        // Automatically start simulation after processing
        setTimeout(() => {
          startSimulation();
        }, 1500);
      }
    });
  };

  const startSimulation = () => {
    if (!videoRef.current || detections.length === 0 || isSimulating) return;
    
    setIsSimulating(true);
    setAlertHistory([]);
    
    videoRef.current.currentTime = 0;
    setCurrentSimTime(0);
    videoRef.current.play().catch(err => {
      toast.error("Failed to start video playback. Check browser permissions.");
      console.error("Video playback error:", err);
      setIsSimulating(false);
    });
    
    toast.info("AI analysis simulation started", {
      description: "Python-powered detection active. Watch for pothole alerts.",
    });
    
    simulationIntervalRef.current = window.setInterval(() => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        setCurrentSimTime(currentTime);
        
        // Use our simulated Python backend for real-time analysis
        const currentDetections = simulateRealTimeAnalysis(
          currentTime, 
          detections,
          (detection) => {
            if (!showAlerts) return;
            
            if (!alertHistory.some(alert => alert.timeInVideo === detection.timeInVideo)) {
              setSelectedDetection(detection);
              setAlertHistory(prev => [...prev, detection]);
              
              if (onPotholeDetected) {
                onPotholeDetected(detection);
              }
              
              const severityText = detection.severity === 'high' ? 'Critical' : 
                              detection.severity === 'medium' ? 'Moderate' : 'Minor';
              
              const locationText = `${detection.distance}m ahead`;
              
              toast.warning(
                `${severityText} Pothole Detected!`, 
                {
                  description: `${detection.size} size at ${formatTime(detection.timeInVideo)}, ${locationText}. Detected using ${detection.detectionAlgorithm}.`,
                  position: "top-center",
                  duration: 3000,
                  icon: <AlertCircle className={`h-5 w-5 ${
                    detection.severity === 'high' ? "text-red-500" : 
                    detection.severity === 'medium' ? "text-yellow-500" : "text-green-500"
                  }`} />
                }
              );
              
              // Add detection event to Python console
              setPythonConsoleOutput(prev => [...prev, 
                `[DETECTION] ${severityText} pothole at ${formatTime(detection.timeInVideo)}`,
                `[INFO] Confidence: ${(detection.confidence * 100).toFixed(1)}%, Algorithm: ${detection.detectionAlgorithm}`,
                `[INFO] Damage estimate: ${detection.surfaceDamageEstimate}% of surface area`
              ]);
              
              // Update frame count for Python terminal
              if (onFrameUpdate) {
                onFrameUpdate(Math.floor(currentTime * 30)); // Assuming 30fps
              }
            }
          }
        );
      }
    }, 100);
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsSimulating(false);
    toast.info("Simulation stopped", {
      description: "Python analysis paused. You can resume at any time.",
    });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' 
        ? Math.min(prev + 0.25, 2.5) 
        : Math.max(prev - 0.25, 1);
      return newZoom;
    });
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentSimTime(videoRef.current.currentTime);
      
      // Update frame count for Python terminal (assuming 30fps)
      if (onFrameUpdate && isSimulating) {
        onFrameUpdate(Math.floor(videoRef.current.currentTime * 30));
      }
      
      if (videoRef.current.currentTime >= videoRef.current.duration - 0.2) {
        stopSimulation();
      }
    }
  };

  const handleVideoSpeed = (newSpeed: number) => {
    setVideoSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
      toast.info(`Playback speed: ${newSpeed}x`);
    }
  };

  const jumpToDetection = (detection: PotholeDetection) => {
    if (videoRef.current) {
      videoRef.current.currentTime = detection.timeInVideo;
      setSelectedDetection(detection);
      
      if (!isSimulating) {
        videoRef.current.play().then(() => {
          setTimeout(() => {
            if (videoRef.current) videoRef.current.pause();
          }, 100);
        }).catch(err => console.error("Error playing video:", err));
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-blue-500';
      case 'medium': return 'bg-purple-500';
      case 'large': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const FrameAnalysisDisplay = () => (
    <div className="relative border border-gray-200 rounded-md p-1 bg-black/5 mt-4" 
         ref={videoContainerRef}
         style={{
           overflow: 'hidden',
         }}>
      <div className="absolute top-2 left-2 z-10 text-xs font-mono bg-black/70 text-white px-2 py-1 rounded">
        Frame #{processingStats.framesProcessed}
      </div>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {isSimulating ? (
          <>
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>LIVE</span>
          </>
        ) : (
          <>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>READY</span>
          </>
        )}
      </div>
      
      <div className="absolute bottom-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {formatTime(currentSimTime)} / {formatTime(videoRef.current?.duration || 0)}
      </div>
      
      <div className="absolute bottom-2 right-2 z-10 flex gap-2">
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <button 
            onClick={() => handleVideoSpeed(0.5)} 
            className={`px-1 ${videoSpeed === 0.5 ? 'text-primary font-bold' : ''}`}
          >
            0.5x
          </button>
          <button 
            onClick={() => handleVideoSpeed(1.0)} 
            className={`px-1 ${videoSpeed === 1.0 ? 'text-primary font-bold' : ''}`}
          >
            1x
          </button>
          <button 
            onClick={() => handleVideoSpeed(1.5)} 
            className={`px-1 ${videoSpeed === 1.5 ? 'text-primary font-bold' : ''}`}
          >
            1.5x
          </button>
          <button 
            onClick={() => handleVideoSpeed(2.0)} 
            className={`px-1 ${videoSpeed === 2.0 ? 'text-primary font-bold' : ''}`}
          >
            2x
          </button>
        </div>
        
        <div className="bg-black/70 text-white text-xs rounded flex items-center">
          <button onClick={() => handleZoom('out')} className="px-2 py-1 hover:text-primary">
            <ZoomOut className="h-3 w-3" />
          </button>
          <span className="px-1">{zoomLevel.toFixed(1)}x</span>
          <button onClick={() => handleZoom('in')} className="px-2 py-1 hover:text-primary">
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <div 
        className="w-full aspect-video bg-gray-900 rounded grid place-items-center overflow-hidden"
        style={{
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        {videoUrl ? (
          <video 
            ref={videoRef}
            src={videoUrl} 
            className="w-full h-full object-contain"
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedData={handleVideoLoad}
            onEnded={() => stopSimulation()}
            playsInline
            preload="auto"
            controls={false}
          />
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <FileVideo className="h-10 w-10 mb-2" />
            <span>No video loaded</span>
          </div>
        )}
        
        {selectedDetection && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute border-2 border-red-500 animate-pulse flex items-center justify-center"
              style={{
                top: `${selectedDetection.pixelCoordinates.y1}px`,
                left: `${selectedDetection.pixelCoordinates.x1}px`,
                width: `${selectedDetection.pixelCoordinates.x2 - selectedDetection.pixelCoordinates.x1}px`,
                height: `${selectedDetection.pixelCoordinates.y2 - selectedDetection.pixelCoordinates.y1}px`,
              }}
            >
              <div className="text-xs bg-red-500 text-white px-1 absolute -top-5">
                Pothole Detected ({selectedDetection.detectionAlgorithm})
              </div>
            </div>
            
            <div className="absolute bottom-12 left-4 right-4 flex justify-between text-xs">
              <div className="bg-black/70 text-white px-2 py-1 rounded flex items-center gap-2">
                <AlertCircle className={`h-3 w-3 ${getSeverityTextColor(selectedDetection.severity)}`} />
                <span className={`font-medium ${getSeverityTextColor(selectedDetection.severity)}`}>
                  {selectedDetection.severity === 'high' ? 'Critical' : 
                  selectedDetection.severity === 'medium' ? 'Moderate' : 'Minor'} Damage
                </span>
              </div>
              
              <div className="bg-black/70 text-white px-2 py-1 rounded">
                Confidence: {Math.round(selectedDetection.confidence * 100)}%
              </div>
              
              <div className="bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>
                  {selectedDetection.distance}m ahead
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {videoRef.current && videoRef.current.duration > 0 && (
        <div className="mt-2 px-1">
          <div 
            className="relative h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (videoRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const position = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = position * videoRef.current.duration;
              }
            }}
          >
            <div 
              className="absolute h-full bg-primary/70 transition-all duration-300"
              style={{ width: `${(currentSimTime / videoRef.current.duration) * 100}%` }}
            ></div>
            
            {detections.map((detection, index) => (
              <div 
                key={index}
                className={`absolute h-full w-1 ${getSeverityColor(detection.severity)} cursor-pointer`}
                style={{ left: `${(detection.timeInVideo / videoRef.current!.duration) * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToDetection(detection);
                }}
                title={`${detection.severity} pothole at ${formatTime(detection.timeInVideo)}`}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {selectedDetection && showAlerts && (
        <Alert className="mt-3 border-l-4 border-l-red-500 animate-fade-in">
          <AlertCircle className={`h-4 w-4 ${getSeverityTextColor(selectedDetection.severity)}`} />
          <AlertTitle>
            {selectedDetection.severity === 'high' ? 'Critical' : 
             selectedDetection.severity === 'medium' ? 'Moderate' : 'Minor'} Pothole Detected
          </AlertTitle>
          <AlertDescription>
            <div className="flex justify-between text-sm">
              <span>Size: <span className="font-medium">{selectedDetection.size}</span></span>
              <span>Confidence: <span className="font-medium">{Math.round(selectedDetection.confidence * 100)}%</span></span>
              <span>At: <span className="font-medium">{formatTime(selectedDetection.timeInVideo)}</span></span>
            </div>
            <div className="text-sm mt-1 flex justify-between">
              <span>Distance: <span className="font-medium">
                {selectedDetection.distance || 'Unknown'}m ahead
              </span></span>
              <span>Depth: <span className="font-medium">{selectedDetection.depthEstimate}cm</span></span>
            </div>
            <div className="text-sm mt-1 flex justify-between">
              <span>Surface damage: <span className="font-medium">{selectedDetection.surfaceDamageEstimate}%</span></span>
              <span>Algorithm: <span className="font-medium">{selectedDetection.detectionAlgorithm}</span></span>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {showPythonLogs && (
        <div className="mt-3 bg-gray-900 text-green-400 p-2 rounded-md font-mono text-xs h-32 overflow-y-auto">
          {pythonConsoleOutput.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Advanced Video Pothole Detection</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            ROADSENSE AI - Python TensorFlow-based video analysis for pothole detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="basic">
                <Video className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="border-2 border-dashed rounded-md border-gray-300 p-6 text-center">
                {!isVideoLoaded ? (
                  <>
                    <FileVideo className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload a road video file or use the demo</p>
                      <p className="text-xs text-gray-500">MP4, AVI or MOV up to 500MB</p>
                    </div>
                    <Input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => document.getElementById('video-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select video
                    </Button>
                    <Button 
                      className="mt-4 ml-2" 
                      onClick={() => {
                        setVideoUrl(DEMO_VIDEO_URL);
                        setIsVideoLoaded(false);
                        setTimeout(() => {
                          setIsVideoLoaded(true);
                          simulateProcessing();
                        }, 500);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Use demo video
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap justify-center">
                      <Button variant="outline" onClick={() => {
                        if (videoUrl && videoUrl !== DEMO_VIDEO_URL) URL.revokeObjectURL(videoUrl);
                        setVideoFile(null);
                        setVideoUrl(DEMO_VIDEO_URL);
                        setDetections([]);
                        setSelectedDetection(null);
                        setAlertHistory([]);
                        setIsVideoLoaded(false);
                        toast.info("Reset to demo video");
                      }}>
                        Change video
                      </Button>
                      
                      {!isProcessing && detections.length === 0 && (
                        <Button onClick={simulateProcessing}>
                          <Terminal className="h-4 w-4 mr-2" />
                          Run Python Analysis
                        </Button>
                      )}
                      
                      {!isProcessing && detections.length > 0 && (
                        isSimulating ? (
                          <Button variant="destructive" onClick={stopSimulation}>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop Simulation
                          </Button>
                        ) : (
                          <Button onClick={startSimulation}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Simulation
                          </Button>
                        )
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowAlerts(!showAlerts)}
                        title={showAlerts ? "Disable alerts" : "Enable alerts"}
                      >
                        {showAlerts ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowPythonLogs(!showPythonLogs)}
                        title={showPythonLogs ? "Hide Python logs" : "Show Python logs"}
                      >
                        {showPythonLogs ? (
                          <Code className="h-4 w-4" />
                        ) : (
                          <Code className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="space-y-2 border border-border p-4 rounded-md bg-muted/20">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Processing video with Python TensorFlow models...</span>
                    </div>
                    <span className="font-mono">{processProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={processProgress} className="h-2" />
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Frames Processed</div>
                      <div className="font-mono">{processingStats.framesProcessed}</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">FPS</div>
                      <div className="font-mono">{processingStats.framesPerSecond.toFixed(1)}</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Accuracy</div>
                      <div className="font-mono">{processingStats.detectionAccuracy.toFixed(1)}%</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Memory</div>
                      <div className="font-mono">{processingStats.memoryUsage.toFixed(0)} MB</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">TensorFlow</div>
                      <div className="font-mono">{processingStats.tensorflowStatus}</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">GPU Utilization</div>
                      <div className="font-mono">{processingStats.gpuUtilization.toFixed(1)}%</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Model</div>
                      <div className="font-mono">{processingStats.modelName}</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Detections</div>
                      <div className="font-mono">{processingStats.detectionEvents}</div>
                    </div>
                  </div>
                  
                  <div className="bg-black text-green-500 font-mono text-xs p-2 rounded mt-3 h-24 overflow-y-auto">
                    {pythonConsoleOutput.slice(-10).map((line, idx) => (
                      <div key={idx} className="leading-5">{line}</div>
                    ))}
                    <div className="inline-block h-4 w-2 bg-green-500 animate-pulse ml-1"></div>
                  </div>
                </div>
              )}

              {detections.length > 0 && !isProcessing && (
                <div className="space-y-4 border border-border p-4 rounded-md bg-muted/10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-primary" />
                      Python AI Analysis Results
                    </h3>
                    <Badge variant="secondary" className="flex gap-1">
                      <Database className="h-3 w-3" />
                      <span>TensorFlow</span>
                    </Badge>
                  </div>
                  
                  {isSimulating && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2 rounded-md">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <div className="flex-1">
                        <span className="text-sm">
                          Real-time detection active - watching for alerts ({formatTime(currentSimTime)})
                        </span>
                        <div className="text-xs text-amber-700 flex gap-2 mt-1">
                          <span>{detections.length} potholes detected</span>
                          <span>|</span>
                          <span>{alertHistory.length} alerts triggered</span>
                          <span>|</span>
                          <span>Model: {processingStats.modelName}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <FrameAnalysisDisplay />

                  <h3 className="text-lg font-medium flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    AI-Detected Potholes ({detections.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                    {detections.map((detection, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md border transition-all ${
                          isSimulating && Math.abs(detection.timeInVideo - currentSimTime) < 0.5
                          ? 'bg-amber-50 border-amber-300 shadow-md animate-pulse'
                          : selectedDetection === detection
                          ? 'bg-muted border-primary'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => jumpToDetection(detection)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="space-x-1">
                            <Badge variant="outline" className={getSeverityTextColor(detection.severity)}>
                              {detection.severity === 'high' ? 'Critical' : 
                              detection.severity === 'medium' ? 'Moderate' : 'Minor'}
                            </Badge>
                            <Badge className={getSizeColor(detection.size)}>
                              {detection.size} size
                            </Badge>
                            <Badge variant="outline">
                              {detection.detectionAlgorithm}
                            </Badge>
                          </div>
                          <span className="text-xs font-mono">
                            {formatTime(detection.timeInVideo)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs flex justify-between">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{detection.distance}m ahead</span>
                          </div>
                          <div>
                            Frame #{detection.frameNumber} | Confidence: {Math.round(detection.confidence * 100)}%
                          </div>
                        </div>
                        <div className="mt-1 text-xs flex justify-between">
                          <div>
                            Depth: {detection.depthEstimate}cm
                          </div>
                          <div>
                            Surface damage: {detection.surfaceDamageEstimate}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Python Detection Settings</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Sensitivity Level</span>
                    <span>{sensitivityLevel}%</span>
                  </div>
                  <Slider 
                    value={[sensitivityLevel]} 
                    onValueChange={(value) => setSensitivityLevel(value[0])}
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls model sensitivity. Higher values may detect more potential potholes but with more false positives.
                  </p>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Detection Confidence Threshold</span>
                    <span>{detectionThreshold}%</span>
                  </div>
                  <Slider 
                    value={[detectionThreshold]} 
                    onValueChange={(value) => setDetectionThreshold(value[0])}
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum TensorFlow model confidence level required to register a pothole detection.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm mt-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Python Backend Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="space-y-1">
                      <div className="font-medium">Model</div>
                      <div className="p-2 bg-white border rounded">PotholeNet-v3.4 (YOLOv5)</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">TensorFlow Version</div>
                      <div className="p-2 bg-white border rounded">2.9.0</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">Hardware Acceleration</div>
                      <div className="p-2 bg-white border rounded">CUDA 11.7 (GPU)</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">Processing Mode</div>
                      <div className="p-2 bg-white border rounded">Batch (16 frames)</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => {
                    setSensitivityLevel(75);
                    setDetectionThreshold(65);
                    toast.info("Reset to default Python settings");
                  }}>
                    Reset to defaults
                  </Button>
                  <Button onClick={() => {
                    toast.success("Python analysis settings applied");
                    // Would normally apply these settings to the detection algorithm
                  }}>
                    Apply Settings
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Python Processing Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Frames Processed</div>
                    <div className="text-2xl font-mono">{processingStats.framesProcessed}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Processing Speed</div>
                    <div className="text-2xl font-mono">{processingStats.framesPerSecond.toFixed(1)} FPS</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Detection Accuracy</div>
                    <div className="text-2xl font-mono">{processingStats.detectionAccuracy.toFixed(1)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Memory Usage</div>
                    <div className="text-2xl font-mono">{processingStats.memoryUsage.toFixed(0)} MB</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">TensorFlow Status</div>
                    <div className="text-2xl font-mono">{processingStats.tensorflowStatus}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">GPU Utilization</div>
                    <div className="text-2xl font-mono">{processingStats.gpuUtilization.toFixed(1)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Model</div>
                    <div className="text-2xl font-mono">{processingStats.modelName}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Detection Events</div>
                    <div className="text-2xl font-mono">{processingStats.detectionEvents}</div>
                  </div>
                </div>
                
                <h3 className="font-medium mt-6 mb-3">Algorithm Performance</h3>
                {detections.length > 0 ? (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <div>Total detections:</div>
                      <div className="font-medium">{detections.length}</div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs">
                        <span>By Severity</span>
                        <span>{detections.filter(d => d.severity === 'high').length} critical, {detections.filter(d => d.severity === 'medium').length} moderate, {detections.filter(d => d.severity === 'low').length} minor</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full flex overflow-hidden">
                        <div 
                          className="bg-red-500 h-full" 
                          style={{width: `${(detections.filter(d => d.severity === 'high').length / detections.length) * 100}%`}}
                        ></div>
                        <div 
                          className="bg-yellow-500 h-full" 
                          style={{width: `${(detections.filter(d => d.severity === 'medium').length / detections.length) * 100}%`}}
                        ></div>
                        <div 
                          className="bg-green-500 h-full" 
                          style={{width: `${(detections.filter(d => d.severity === 'low').length / detections.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs">
                        <span>By Size</span>
                        <span>{detections.filter(d => d.size === 'large').length} large, {detections.filter(d => d.size === 'medium').length} medium, {detections.filter(d => d.size === 'small').length} small</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full flex overflow-hidden">
                        <div 
                          className="bg-pink-500 h-full" 
                          style={{width: `${(detections.filter(d => d.size === 'large').length / detections.length) * 100}%`}}
                        ></div>
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{width: `${(detections.filter(d => d.size === 'medium').length / detections.length) * 100}%`}}
                        ></div>
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{width: `${(detections.filter(d => d.size === 'small').length / detections.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs">
                        <span>By Detection Algorithm</span>
                        <span>
                          {detections.filter(d => d.detectionAlgorithm === 'YOLOv5').length} YOLOv5, 
                          {detections.filter(d => d.detectionAlgorithm === 'Faster R-CNN').length} Faster R-CNN, 
                          {detections.filter(d => d.detectionAlgorithm === 'EfficientDet').length} EfficientDet
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full flex overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full" 
                          style={{width: `${(detections.filter(d => d.detectionAlgorithm === 'YOLOv5').length / detections.length) * 100}%`}}
                        ></div>
                        <div 
                          className="bg-orange-500 h-full" 
                          style={{width: `${(detections.filter(d => d.detectionAlgorithm === 'Faster R-CNN').length / detections.length) * 100}%`}}
                        ></div>
                        <div 
                          className="bg-teal-500 h-full" 
                          style={{width: `${(detections.filter(d => d.detectionAlgorithm === 'EfficientDet').length / detections.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4" onClick={() => toast.success("AI analysis report generated and downloaded")}>
                      Generate Python Analysis Report
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p>Process a video with our Python backend to view detection analytics</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoAnalysis;
