
import React, { useState, useEffect, useRef } from 'react';
import VideoAnalysis from '@/components/VideoAnalysis';
import DriverAlerts from '@/components/alerts/DriverAlerts';
import DataManagement from '@/components/alerts/DataManagement';
import PythonTerminal from '@/components/PythonTerminal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Bell, Terminal, Bot, MessageCircle } from 'lucide-react';
import { speakAlertWithSeverity, AlertSeverity, cancelSpeech } from '@/utils/voiceAlert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PotholeDetection } from '@/utils/simulatedPythonBackend';
import { Button } from '@/components/ui/button';
import PotholeChatBot from './PotholeChatBot';

const VideoAnalysisWithAlerts: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [currentAlert, setCurrentAlert] = useState<{
    message: string;
    severity: AlertSeverity;
  } | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const alertTimerRef = useRef<number | null>(null);

  const handleSimulationChange = (simulating: boolean) => {
    setIsSimulating(simulating);
    
    // Reset alerts when simulation starts or stops
    if (simulating) {
      toast.info("Driver alert system activated", {
        description: "Voice alerts will play when potholes are detected"
      });
    } else {
      toast.info("Driver alert system deactivated");
      setCurrentAlert(null);
      
      // Clear any pending timers
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
    }
  };
  
  const handleFrameUpdate = (count: number) => {
    setFrameCount(count);
  };
  
  // Handle incoming alerts from video analysis
  const handleDetection = (detection: PotholeDetection) => {
    if (!isSimulating) return;
    
    const distance = detection.distance || 50;
    let message = "";
    
    switch(detection.severity) {
      case 'high':
        message = `Warning! Critical pothole ahead at ${distance} meters. ${detection.depthEstimate}cm deep, ${detection.surfaceDamageEstimate}% surface damage. Detected using ${detection.detectionAlgorithm}.`;
        break;
      case 'medium':
        message = `Caution! Pothole detected ${distance} meters ahead. Approximately ${detection.depthEstimate}cm deep. Detected by ${detection.detectionAlgorithm} algorithm.`;
        break;
      case 'low':
        message = `Notice: Minor road damage ${distance} meters ahead. Surface damage estimated at ${detection.surfaceDamageEstimate}%. ${detection.detectionAlgorithm} confidence: ${Math.round(detection.confidence * 100)}%.`;
        break;
    }
    
    setCurrentAlert({ message, severity: detection.severity });
    speakAlertWithSeverity(message, detection.severity);
  };
  
  // Process alerts when they change
  useEffect(() => {
    if (currentAlert) {
      // This would normally come from the VideoAnalysis component
      // but we're simulating it here for demonstration purposes
      toast.warning(currentAlert.message, {
        duration: 4000,
        icon: <Bell className="h-5 w-5" />
      });
      
      // Clear alert after display
      alertTimerRef.current = window.setTimeout(() => {
        setCurrentAlert(null);
      }, 5000) as unknown as number;
    }
    
    // Cleanup function to clear the timeout when component unmounts or alert changes
    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
    };
  }, [currentAlert]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <VideoAnalysis 
          onSimulationChange={handleSimulationChange} 
          onPotholeDetected={handleDetection}
          onFrameUpdate={handleFrameUpdate}
        />
      </div>
      <div className="lg:col-span-1">
        <Card className="h-full bg-card/95 border-border shadow-lg">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 bg-muted/70">
                  <TabsTrigger value="alerts" className="flex items-center text-foreground">
                    <Bell className="h-4 w-4 mr-2" />
                    Driver Alerts
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center text-foreground">
                    <Database className="h-4 w-4 mr-2" />
                    Data Management
                  </TabsTrigger>
                  <TabsTrigger value="python" className="flex items-center text-foreground">
                    <Terminal className="h-4 w-4 mr-2" />
                    Python
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center text-foreground">
                    <Bot className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <TabsContent value="alerts" className="mt-0">
              <DriverAlerts 
                simulationActive={isSimulating} 
                currentAlert={currentAlert?.message} 
                alertSeverity={currentAlert?.severity} 
              />
            </TabsContent>
            <TabsContent value="data" className="mt-0">
              <DataManagement simulationActive={isSimulating} />
            </TabsContent>
            <TabsContent value="python" className="mt-0">
              <PythonTerminal active={isSimulating} frameCount={frameCount} />
            </TabsContent>
            <TabsContent value="chat" className="mt-0">
              <div className="h-[400px]">
                <PotholeChatBot />
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoAnalysisWithAlerts;
