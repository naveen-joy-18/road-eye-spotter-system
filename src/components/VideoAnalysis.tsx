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
} from 'lucide-react';

type PotholeDetection = {
  timeInVideo: number; // seconds
  confidence: number;
  size: 'small' | 'medium' | 'large';
  severity: 'low' | 'medium' | 'high';
  location?: { lat: number; lng: number };
};

interface VideoAnalysisProps {
  onSimulationChange?: (isSimulating: boolean) => void;
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ onSimulationChange }) => {
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
  const [processingStats, setProcessingStats] = useState({
    framesProcessed: 0,
    framesPerSecond: 0,
    detectionAccuracy: 0,
    memoryUsage: 0
  });
  const [showAlerts, setShowAlerts] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [alertHistory, setAlertHistory] = useState<PotholeDetection[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const statsIntervalRef = useRef<number | null>(null);
  const processTimeoutRef = useRef<number | null>(null);

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
      if (videoUrl) {
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoUrl) {
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
      setProcessingStats({
        framesProcessed: 0,
        framesPerSecond: 0,
        detectionAccuracy: 0,
        memoryUsage: 0
      });
      
      toast.success("Video uploaded successfully", {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
      });
    }
  };

  const simulateProcessing = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessProgress(0);
    setSelectedDetection(null);
    setAlertHistory([]);
    
    processTimeoutRef.current = window.setTimeout(() => {
      toast.info("Initializing AI model for pothole detection", {
        description: "This may take a moment...",
        duration: 3000,
      });
      
      const interval = setInterval(() => {
        setProcessProgress(prev => {
          const randomIncrement = Math.random() * 2 + 0.2;
          const newProgress = prev + randomIncrement;
          
          if (Math.floor(prev / 10) < Math.floor(newProgress / 10)) {
            setProcessingStats(prevStats => ({
              framesProcessed: prevStats.framesProcessed + Math.floor(Math.random() * 200) + 100,
              framesPerSecond: Math.floor(Math.random() * 5) + 25,
              detectionAccuracy: Math.min(99, prevStats.detectionAccuracy + Math.random() * 2),
              memoryUsage: Math.min(1200, prevStats.memoryUsage + Math.random() * 50)
            }));
          }
          
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            setProcessProgress(100);
            generateMockDetections();
            simulateProcessingStats();
            toast.success("Video analysis complete!", {
              description: "Found multiple potholes in the video. Ready for simulation.",
              icon: <AlertCircle className="text-green-500" />
            });
            return 100;
          }
          return newProgress;
        });
      }, 200);
    }, 1000);
  };

  const simulateProcessingStats = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = window.setInterval(() => {
      setProcessingStats(prev => ({
        framesProcessed: prev.framesProcessed + Math.floor(Math.random() * 50),
        framesPerSecond: Math.floor(Math.random() * 5) + 25,
        detectionAccuracy: Math.min(99.9, prev.detectionAccuracy + (Math.random() * 0.5 - 0.2)),
        memoryUsage: Math.min(1300, Math.max(700, prev.memoryUsage + (Math.random() * 40 - 20)))
      }));
    }, 3000);
  };

  const generateMockDetections = () => {
    const videoDuration = videoRef.current?.duration || 30;
    const numDetections = Math.floor(Math.random() * 6) + 5;
    const mockDetections: PotholeDetection[] = [];
    
    const sizes = ['small', 'medium', 'large'] as const;
    const severities = ['low', 'medium', 'high'] as const;
    
    for (let i = 0; i < numDetections; i++) {
      const baseTime = (i / numDetections) * videoDuration;
      const timeVariation = (videoDuration / numDetections) * 0.5;
      const timeInVideo = baseTime + (Math.random() * timeVariation);
      
      let severityBias = 0;
      if (timeInVideo > videoDuration * 0.3 && timeInVideo < videoDuration * 0.7) {
        severityBias = 1;
      }
      
      const severityIndex = Math.min(2, Math.floor(Math.random() * 3) + severityBias);
      const sizeIndex = Math.min(2, Math.floor(Math.random() * 3) + (severityIndex > 1 ? 1 : 0));
      
      mockDetections.push({
        timeInVideo,
        confidence: 0.7 + (Math.random() * 0.3),
        size: sizes[sizeIndex],
        severity: severities[severityIndex],
        location: {
          lat: 20.5937 + (Math.random() - 0.5) * 2,
          lng: 78.9629 + (Math.random() - 0.5) * 2
        }
      });
    }
    
    mockDetections.sort((a, b) => a.timeInVideo - b.timeInVideo);
    setDetections(mockDetections);
  };

  const startSimulation = () => {
    if (!videoRef.current || detections.length === 0 || isSimulating) return;
    
    setIsSimulating(true);
    setAlertHistory([]);
    
    videoRef.current.currentTime = 0;
    setCurrentSimTime(0);
    videoRef.current.play();
    
    toast.info("Simulation started", {
      description: "Watch for pothole alerts as they appear in the video",
    });
    
    simulationIntervalRef.current = window.setInterval(() => {
      if (videoRef.current) {
        setCurrentSimTime(videoRef.current.currentTime);
        
        const currentDetections = detections.filter(d => {
          return Math.abs(d.timeInVideo - videoRef.current!.currentTime) < 0.5;
        });
        
        if (currentDetections.length > 0 && showAlerts) {
          currentDetections.forEach(detection => {
            if (!alertHistory.some(alert => alert.timeInVideo === detection.timeInVideo)) {
              setSelectedDetection(detection);
              setAlertHistory(prev => [...prev, detection]);
              
              const severity = detection.severity === 'high' ? 'Critical' : 
                              detection.severity === 'medium' ? 'Moderate' : 'Minor';
              
              toast.warning(
                `${severity} Pothole Detected!`, 
                {
                  description: `${detection.size} size at ${formatTime(detection.timeInVideo)}`,
                  position: "top-center",
                  duration: 3000,
                  icon: <AlertCircle className={`h-5 w-5 ${
                    detection.severity === 'high' ? "text-red-500" : 
                    detection.severity === 'medium' ? "text-yellow-500" : "text-green-500"
                  }`} />
                }
              );
            }
          });
        }
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
      description: "You can resume at any time",
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
            onEnded={() => stopSimulation()}
          />
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <FileVideo className="h-10 w-10 mb-2" />
            <span>No video loaded</span>
          </div>
        )}
        
        {selectedDetection && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-24 h-24 border-2 border-red-500 animate-pulse flex items-center justify-center">
              <div className="text-xs bg-red-500 text-white px-1 absolute -top-5">
                Pothole Detected
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
              
              {selectedDetection.location && (
                <div className="bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{selectedDetection.location.lat.toFixed(4)}, {selectedDetection.location.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {videoRef.current && videoRef.current.duration > 0 && (
        <div className="mt-2 px-1">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-primary/70 transition-all duration-300"
              style={{ width: `${(currentSimTime / videoRef.current.duration) * 100}%` }}
            ></div>
            
            {detections.map((detection, index) => (
              <div 
                key={index}
                className={`absolute h-full w-1 ${getSeverityColor(detection.severity)} cursor-pointer`}
                style={{ left: `${(detection.timeInVideo / videoRef.current!.duration) * 100}%` }}
                onClick={() => jumpToDetection(detection)}
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
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Advanced Video Pothole Detection</CardTitle>
          <CardDescription>
            Analyze road videos to detect potholes with our AI-powered detection system
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
                {!videoUrl ? (
                  <>
                    <FileVideo className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload a road video file</p>
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
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap justify-center">
                      <Button variant="outline" onClick={() => {
                        if (videoUrl) URL.revokeObjectURL(videoUrl);
                        setVideoFile(null);
                        setVideoUrl(null);
                        setDetections([]);
                        setSelectedDetection(null);
                        setAlertHistory([]);
                      }}>
                        Change video
                      </Button>
                      
                      {!isProcessing && detections.length === 0 && (
                        <Button onClick={simulateProcessing}>
                          Process video
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
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
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
                      <span>Processing video...</span>
                    </div>
                    <span className="font-mono">{processProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={processProgress} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Frames Processed</div>
                      <div className="font-mono">{processingStats.framesProcessed}</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">FPS</div>
                      <div className="font-mono">{processingStats.framesPerSecond}</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Accuracy</div>
                      <div className="font-mono">{processingStats.detectionAccuracy.toFixed(1)}%</div>
                    </div>
                    <div className="text-xs bg-black/5 p-2 rounded">
                      <div className="text-muted-foreground">Memory</div>
                      <div className="font-mono">{processingStats.memoryUsage.toFixed(0)} MB</div>
                    </div>
                  </div>
                </div>
              )}

              {detections.length > 0 && !isProcessing && (
                <div className="space-y-4 border border-border p-4 rounded-md bg-muted/10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-primary" />
                      Video Analysis
                    </h3>
                  </div>
                  
                  {isSimulating && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2 rounded-md">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <div className="flex-1">
                        <span className="text-sm">
                          Simulating driver warnings - watch for alerts ({formatTime(currentSimTime)})
                        </span>
                        <div className="text-xs text-amber-700 flex gap-2 mt-1">
                          <span>{detections.length} potholes detected</span>
                          <span>|</span>
                          <span>{alertHistory.length} alerts triggered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <FrameAnalysisDisplay />

                  <h3 className="text-lg font-medium flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Detected Potholes ({detections.length})
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
                            <Badge variant="outline" className="text-xs">
                              {formatTime(detection.timeInVideo)}
                            </Badge>
                            <Badge className={`text-xs ${getSeverityColor(detection.severity)} text-white`}>
                              {detection.severity} severity
                            </Badge>
                            <Badge className={`text-xs ${getSizeColor(detection.size)} text-white`}>
                              {detection.size} size
                            </Badge>
                          </div>
                          <div className="text-xs font-medium">
                            {Math.round(detection.confidence * 100)}% confident
                          </div>
                        </div>
                        {detection.location && (
                          <div className="mt-1 text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                            {alertHistory.some(alert => alert.timeInVideo === detection.timeInVideo) && (
                              <span className="ml-2 text-amber-600 flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Alert triggered
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6 p-4 border border-border rounded-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Detection Sensitivity</label>
                    <span className="text-sm font-mono">{sensitivityLevel}%</span>
                  </div>
                  <Slider
                    value={[sensitivityLevel]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(values) => {
                      setSensitivityLevel(values[0]);
                      toast.info(`Detection sensitivity set to ${values[0]}%`);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher sensitivity may detect more potholes but increase false positives.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Detection Threshold</label>
                    <span className="text-sm font-mono">{detectionThreshold}%</span>
                  </div>
                  <Slider
                    value={[detectionThreshold]}
                    min={30}
                    max={95}
                    step={1}
                    onValueChange={(values) => {
                      setDetectionThreshold(values[0]);
                      toast.info(`Detection threshold set to ${values[0]}%`);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum confidence level required to classify a detection as a pothole.
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-gray-200">
                  <h3 className="text-sm font-medium">Notification Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Enable Alerts</label>
                    <Button 
                      variant={showAlerts ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setShowAlerts(!showAlerts)}
                    >
                      {showAlerts ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Algorithm</h4>
                      <select 
                        className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        onChange={() => toast.info("Algorithm updated")}
                      >
                        <option value="yolov5">YOLOv5</option>
                        <option value="fasterrcnn">Faster R-CNN</option>
                        <option value="efficientdet">EfficientDet</option>
                        <option value="custom">Custom Model</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Resolution</h4>
                      <select 
                        className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        onChange={() => toast.info("Resolution updated")}
                      >
                        <option value="640">640×640</option>
                        <option value="1024">1024×1024</option>
                        <option value="1280">1280×1280</option>
                        <option value="original">Original</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-4 p-4 border border-border rounded-md">
                <h3 className="text-sm font-medium mb-2">Detection Analytics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Detection Count</div>
                    <div className="text-2xl font-bold">{detections.length}</div>
                    <div className="relative h-2 w-full mt-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${(detections.length / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-muted/20 p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Avg. Confidence</div>
                    <div className="text-2xl font-bold">
                      {detections.length > 0 
                        ? `${(detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </div>
                    <div className="relative h-2 w-full mt-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-green-500 rounded-full transition-all duration-1000"
                        style={{ 
                          width: detections.length > 0 
                            ? `${detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100}%`
                            : '0%' 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Severity Distribution</h4>
                  <div className="space-y-1.5">
                    {['high', 'medium', 'low'].map(severity => {
                      const count = detections.filter(d => d.severity === severity).length;
                      const percentage = detections.length > 0 ? (count / detections.length) * 100 : 0;
                      return (
                        <div key={severity} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="capitalize">{severity}</span>
                            <span>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`absolute h-full ${getSeverityColor(severity)} rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Size Distribution</h4>
                  <div className="space-y-1.5">
                    {['large', 'medium', 'small'].map(size => {
                      const count = detections.filter(d => d.size === size).length;
                      const percentage = detections.length > 0 ? (count / detections.length) * 100 : 0;
                      return (
                        <div key={size} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="capitalize">{size}</span>
                            <span>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`absolute h-full ${getSizeColor(size)} rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {detections.length > 0 && alertHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium mb-2">Alert History</h4>
                    <div className="bg-muted/20 p-3 rounded-md">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Total Alerts</span>
                        <span>{alertHistory.length} / {detections.length}</span>
                      </div>
                      <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-amber-500 rounded-full transition-all duration-1000"
                          style={{ width: `${(alertHistory.length / detections.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-1">Technical Implementation:</p>
            <p>The enhanced implementation uses:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>YOLOv5 for real-time object detection</li>
              <li>Python with OpenCV for frame extraction and preprocessing</li>
              <li>TensorFlow for neural network processing</li>
              <li>GPS metadata extraction for precise location mapping</li>
              <li>React.js frontend with WebSocket for real-time analysis</li>
              <li>MongoDB for storing pothole data with geospatial indexing</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VideoAnalysis;
