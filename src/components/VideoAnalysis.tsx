
import React, { useState, useRef } from 'react';
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
import { toast } from 'sonner';
import { AlertCircle, FileVideo, Upload, Video } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setDetections([]);
      setProcessProgress(0);
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
          toast.success("Video analysis complete!");
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  const generateMockDetections = () => {
    // Generate 3-7 random pothole detections for simulation
    const videoDuration = videoRef.current?.duration || 30;
    const numDetections = Math.floor(Math.random() * 5) + 3;
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
            toast.warning(`Pothole ahead! ${currentDetection.size} size, ${currentDetection.severity} severity`, {
              position: "top-center",
              duration: 2000,
            });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Video Pothole Detection</CardTitle>
          <CardDescription>
            Upload a driving video to analyze for potholes and simulate driver warnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-md border-gray-300 p-6 text-center">
            {!videoUrl ? (
              <>
                <FileVideo className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Upload a video file</p>
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing video...</span>
                <span>{processProgress}%</span>
              </div>
              <Progress value={processProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Analyzing frames for pothole detection
              </p>
            </div>
          )}

          {detections.length > 0 && !isProcessing && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Simulation</h3>
                {isSimulating ? (
                  <Button variant="destructive" onClick={stopSimulation}>
                    Stop Simulation
                  </Button>
                ) : (
                  <Button onClick={startSimulation}>
                    <Video className="h-4 w-4 mr-2" />
                    Start Simulation
                  </Button>
                )}
              </div>
              
              {isSimulating && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    Simulating driver warnings - watch for alerts
                  </span>
                </div>
              )}

              <h3 className="text-lg font-medium">Detected Potholes ({detections.length})</h3>
              <div className="space-y-2">
                {detections.map((detection, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-md border ${
                      isSimulating && Math.abs(detection.timeInVideo - currentSimTime) < 0.5
                      ? 'bg-amber-50 border-amber-300'
                      : 'border-gray-200'
                    }`}
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-1">How it works:</p>
            <p>The actual implementation would use Python and machine learning to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Extract frames from video</li>
              <li>Process frames with a CNN model</li>
              <li>Detect potholes and estimate size</li>
              <li>Calculate GPS position from video metadata</li>
              <li>Store pothole data for analysis</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VideoAnalysis;
