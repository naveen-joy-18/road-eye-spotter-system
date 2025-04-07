
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
  RotateCw
} from 'lucide-react';

type PotholeDetection = {
  timeInVideo: number; // seconds
  confidence: number;
  size: 'small' | 'medium' | 'large';
  severity: 'low' | 'medium' | 'high';
  location?: { lat: number; lng: number };
};

const VideoAnalysis: React.FC = () => {
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const statsIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setDetections([]);
      setProcessProgress(0);
      setProcessingStats({
        framesProcessed: 0,
        framesPerSecond: 0,
        detectionAccuracy: 0,
        memoryUsage: 0
      });
    }
  };

  const simulateProcessing = () => {
    setIsProcessing(true);
    setProcessProgress(0);
    
    // Simulate processing progress
    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          generateMockDetections();
          simulateProcessingStats();
          toast.success("Video analysis complete!", {
            description: "Found multiple potholes in the video."
          });
          return 100;
        }
        return prev + (Math.random() * 2 + 0.5);
      });
    }, 200);
  };

  const simulateProcessingStats = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    // Simulate real-time processing stats
    statsIntervalRef.current = window.setInterval(() => {
      setProcessingStats({
        framesProcessed: Math.floor(Math.random() * 500) + 2500,
        framesPerSecond: Math.floor(Math.random() * 5) + 25,
        detectionAccuracy: Math.random() * 10 + 85, // 85-95%
        memoryUsage: Math.random() * 300 + 700 // 700-1000 MB
      });
    }, 3000);
  };

  const generateMockDetections = () => {
    // Generate 5-10 random pothole detections for simulation
    const videoDuration = videoRef.current?.duration || 30;
    const numDetections = Math.floor(Math.random() * 6) + 5;
    const mockDetections: PotholeDetection[] = [];
    
    const sizes = ['small', 'medium', 'large'] as const;
    const severities = ['low', 'medium', 'high'] as const;
    
    for (let i = 0; i < numDetections; i++) {
      const timeInVideo = Math.random() * videoDuration;
      const sizeIndex = Math.floor(Math.random() * 3);
      const severityIndex = Math.floor(Math.random() * 3);
      
      mockDetections.push({
        timeInVideo,
        confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        size: sizes[sizeIndex],
        severity: severities[severityIndex],
        location: {
          lat: 20.5937 + (Math.random() - 0.5),
          lng: 78.9629 + (Math.random() - 0.5)
        }
      });
    }
    
    // Sort by time in video
    mockDetections.sort((a, b) => a.timeInVideo - b.timeInVideo);
    setDetections(mockDetections);
  };

  const startSimulation = () => {
    if (videoRef.current && detections.length > 0) {
      setIsSimulating(true);
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      
      simulationIntervalRef.current = window.setInterval(() => {
        if (videoRef.current) {
          setCurrentSimTime(videoRef.current.currentTime);
          
          // Check for pothole detections at current time
          const currentDetection = detections.find(d => {
            // Check if we're within 0.5 seconds of a detection
            return Math.abs(d.timeInVideo - videoRef.current!.currentTime) < 0.5;
          });
          
          if (currentDetection) {
            // Alert the driver
            setSelectedDetection(currentDetection);
            toast.warning(
              `Pothole Detected!`, 
              {
                description: `${currentDetection.size} size, ${currentDetection.severity} severity`,
                position: "top-center",
                duration: 2000,
                icon: <AlertCircle className="h-5 w-5 text-warning" />
              }
            );
          }
        }
      }, 100);
    }
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
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  // Simulate frame analysis display
  const FrameAnalysisDisplay = () => (
    <div className="relative border border-gray-200 rounded-md p-1 bg-black/5 mt-4">
      <div className="absolute top-2 left-2 text-xs font-mono bg-black/70 text-white px-2 py-1 rounded">
        Frame #{processingStats.framesProcessed}
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>PROCESSING</span>
      </div>
      <div 
        className="w-full aspect-video bg-gray-900 rounded grid place-items-center overflow-hidden"
        style={{
          backgroundImage: videoUrl ? `url(${videoUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Simulated detection overlays */}
        {selectedDetection && (
          <>
            <div className="absolute inset-0">
              <div className="absolute top-1/3 left-1/4 w-24 h-24 border-2 border-red-500 animate-pulse flex items-center justify-center">
                <div className="text-xs bg-red-500 text-white px-1 absolute -top-5">
                  Pothole Detected
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex justify-between text-white text-xs">
              <span className="bg-black/50 px-1 py-0.5 rounded">
                Confidence: {Math.round(selectedDetection.confidence * 100)}%
              </span>
              <span className="bg-black/50 px-1 py-0.5 rounded">
                Size: {selectedDetection.size}
              </span>
              <span className="bg-black/50 px-1 py-0.5 rounded">
                Severity: {selectedDetection.severity}
              </span>
            </div>
          </>
        )}
      </div>
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
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls
                      className="mx-auto max-h-[300px] rounded"
                      onEnded={() => stopSimulation()}
                    />
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => {
                        setVideoFile(null);
                        setVideoUrl(null);
                        setDetections([]);
                        setSelectedDetection(null);
                      }}>
                        Change video
                      </Button>
                      {!isProcessing && detections.length === 0 && (
                        <Button onClick={simulateProcessing}>
                          Process video
                        </Button>
                      )}
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
                      Simulation
                    </h3>
                    {isSimulating ? (
                      <Button variant="destructive" onClick={stopSimulation} size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        Stop Simulation
                      </Button>
                    ) : (
                      <Button onClick={startSimulation} size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Start Simulation
                      </Button>
                    )}
                  </div>
                  
                  {isSimulating && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2 rounded-md">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="text-sm">
                        Simulating driver warnings - watch for alerts ({formatTime(currentSimTime)})
                      </span>
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
                          ? 'bg-amber-50 border-amber-300 shadow-md'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = detection.timeInVideo;
                            setSelectedDetection(detection);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="space-x-1">
                            <Badge variant="outline" className="text-xs">
                              {Math.floor(detection.timeInVideo / 60)}:{Math.floor(detection.timeInVideo % 60).toString().padStart(2, '0')}
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
                    onValueChange={(values) => setSensitivityLevel(values[0])}
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
                    onValueChange={(values) => setDetectionThreshold(values[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum confidence level required to classify a detection as a pothole.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Algorithm</h4>
                    <select className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                      <option value="yolov5">YOLOv5</option>
                      <option value="fasterrcnn">Faster R-CNN</option>
                      <option value="efficientdet">EfficientDet</option>
                      <option value="custom">Custom Model</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Resolution</h4>
                    <select className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                      <option value="640">640×640</option>
                      <option value="1024">1024×1024</option>
                      <option value="1280">1280×1280</option>
                      <option value="original">Original</option>
                    </select>
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
                        className="absolute h-full bg-primary rounded-full"
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
                        className="absolute h-full bg-green-500 rounded-full"
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
                              className={`absolute h-full ${getSeverityColor(severity)} rounded-full`}
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
                              className={`absolute h-full ${getSizeColor(size)} rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
