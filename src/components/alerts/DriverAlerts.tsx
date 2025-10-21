
import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Clock, MapPin, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { speakAlertWithSeverity, AlertSeverity, cancelSpeech } from '@/utils/voiceAlert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DriverAlertsProps {
  simulationActive: boolean;
  currentAlert?: string;
  alertSeverity?: AlertSeverity;
}

// Removed INDIAN_LOCATIONS - no longer needed

const DriverAlerts: React.FC<DriverAlertsProps> = ({ 
  simulationActive, 
  currentAlert,
  alertSeverity = 'medium'
}) => {
  const [alertDistance, setAlertDistance] = useState(0);
  const [alertProgress, setAlertProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioVolume, setAudioVolume] = useState(80);
  const [currentAlertText, setCurrentAlertText] = useState<string | null>(null);
  const [alertHistory, setAlertHistory] = useState<Array<{
    timestamp: Date;
    message: string;
    severity: AlertSeverity;
    location?: string;
  }>>([]);

  useEffect(() => {
    let timer: number | null = null;
    
    if (simulationActive) {
      // Simulate approaching a pothole while driving
      timer = window.setInterval(() => {
        setAlertDistance(prev => {
          // Random fluctuation in distance detection
          return Math.max(0, prev - (Math.random() * 5 + 3));
        });
      }, 1000);
      
      // Removed automatic random alerts - alerts only come from actual detections
    } else {
      setAlertDistance(0);
      setAlertProgress(0);
      setCurrentAlertText(null);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [simulationActive]);
  
  // Handle new alerts coming from props
  useEffect(() => {
    if (currentAlert && simulationActive) {
      handleAlert(currentAlert, alertSeverity);
    }
  }, [currentAlert, alertSeverity, simulationActive]);
  
  // Progress bar animation
  useEffect(() => {
    if (alertDistance > 0) {
      setAlertProgress(Math.max(0, 100 - (alertDistance / 100) * 100));
    } else {
      setAlertProgress(0);
    }
  }, [alertDistance]);
  
  const createAlertMessage = (severity: AlertSeverity, distance: number): string => {
    const locationText = `${distance} meters ahead`;
    
    switch(severity) {
      case 'high':
        return `Warning! Critical pothole ${locationText}. Reduce speed immediately.`;
      case 'medium':
        return `Caution! Pothole detected ${locationText}. Prepare to slow down.`;
      case 'low':
        return `Notice: Minor road damage ${locationText}.`;
      default:
        return `Road anomaly detected ${locationText}.`;
    }
  };
  
  const handleAlert = (message: string, severity: AlertSeverity) => {
    setCurrentAlertText(message);
    
    // Add to history
    setAlertHistory(prev => [
      {
        timestamp: new Date(),
        message,
        severity
      },
      ...prev.slice(0, 9) // Keep last 10 alerts
    ]);
    
    // Speak alert if audio is enabled
    if (audioEnabled) {
      speakAlertWithSeverity(message, severity);
    }
    
    // Clear alert after display
    setTimeout(() => {
      setCurrentAlertText(null);
    }, 5000);
  };
  
  const handleToggleAudio = (enabled: boolean) => {
    setAudioEnabled(enabled);
    if (!enabled) {
      cancelSpeech();
    } else {
      // Only speak if simulation is active to avoid random alerts
      if (simulationActive) {
        speakAlertWithSeverity("Voice alert system activated", "low");
      }
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch(severity) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };
  
  const getSeverityBg = (severity: AlertSeverity): string => {
    switch(severity) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn(
            "h-2 w-2 rounded-full mr-2",
            simulationActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )}></div>
          <span className="text-sm font-medium">
            {simulationActive ? "Driver Alert System Active" : "System Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            id="audio-toggle" 
            checked={audioEnabled} 
            onCheckedChange={handleToggleAudio} 
          />
          <Label htmlFor="audio-toggle" className="cursor-pointer">
            {audioEnabled ? 
              <Volume2 className="h-4 w-4 text-primary" /> : 
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            }
          </Label>
        </div>
      </div>
      
      {audioEnabled && (
        <div className="flex items-center gap-2">
          <Volume1 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[audioVolume]}
            min={0}
            max={100}
            step={5}
            className="flex-1"
            onValueChange={(value) => setAudioVolume(value[0])}
          />
          <span className="text-xs font-mono w-7 text-right">{audioVolume}%</span>
        </div>
      )}
      
      {simulationActive && (
        <>
          {currentAlertText ? (
            <Alert className={cn(
              "border",
              getSeverityBg(alertSeverity)
            )}>
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription className="font-medium">
                {currentAlertText}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Monitoring Indian road conditions...</span>
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <Progress value={Math.random() * 20 + 10} className="h-1" />
            </div>
          )}
          
          <div className="bg-gray-100 rounded-md p-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Potential hazards</span>
              <span>{alertDistance > 0 ? `${Math.round(alertDistance)}m ahead` : "None detected"}</span>
            </div>
            <Progress value={alertProgress} className="h-2" />
          </div>
        </>
      )}
      
      {!simulationActive && (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-md">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            Driver alerts will appear here<br />when simulation is active
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-4"
            disabled
          >
            Start Simulation
          </Button>
        </div>
      )}
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Alerts
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {alertHistory.length > 0 ? alertHistory.map((alert, idx) => (
            <div 
              key={idx} 
              className={cn(
                "text-xs p-2 rounded border",
                getSeverityBg(alert.severity)
              )}
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  {alert.severity === 'high' ? 'Critical Alert' : 
                   alert.severity === 'medium' ? 'Warning' : 'Notice'}
                </span>
                <span className="text-muted-foreground">
                  {alert.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 break-words">{alert.message}</p>
            </div>
          )) : (
            <div className="text-xs text-center py-2 text-muted-foreground">
              No alerts recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverAlerts;
