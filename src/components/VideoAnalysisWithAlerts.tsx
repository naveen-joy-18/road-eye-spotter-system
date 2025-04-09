
import React, { useState, useEffect } from 'react';
import VideoAnalysis from '@/components/VideoAnalysis';
import DriverAlerts from '@/components/alerts/DriverAlerts';
import DataManagement from '@/components/alerts/DataManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Bell } from 'lucide-react';
import { speakAlertWithSeverity, AlertSeverity } from '@/utils/voiceAlert';
import { toast } from 'sonner';

const VideoAnalysisWithAlerts: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [currentAlert, setCurrentAlert] = useState<{
    message: string;
    severity: AlertSeverity;
  } | null>(null);

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
    }
  };
  
  // Handle incoming alerts from video analysis
  const handleDetection = (severity: AlertSeverity, distance: number) => {
    if (!isSimulating) return;
    
    let message = "";
    
    switch(severity) {
      case 'high':
        message = `Warning! Critical pothole ahead at ${distance} meters. Reduce speed immediately.`;
        break;
      case 'medium':
        message = `Caution! Pothole detected ${distance} meters ahead. Prepare to slow down.`;
        break;
      case 'low':
        message = `Notice: Minor road damage ${distance} meters ahead.`;
        break;
    }
    
    setCurrentAlert({ message, severity });
    speakAlertWithSeverity(message, severity);
  };
  
  // Process alerts when they change
  useEffect(() => {
    let timer: number | null = null;
    
    if (currentAlert) {
      // This would normally come from the VideoAnalysis component
      // but we're simulating it here for demonstration purposes
      toast.warning(currentAlert.message, {
        duration: 4000,
        icon: <Bell className="h-5 w-5" />
      });
      
      // Clear alert after display
      timer = window.setTimeout(() => {
        setCurrentAlert(null);
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentAlert]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <VideoAnalysis 
          onSimulationChange={handleSimulationChange} 
          onPotholeDetected={handleDetection}
        />
      </div>
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="alerts" className="flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Driver Alerts
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Data Management
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoAnalysisWithAlerts;
