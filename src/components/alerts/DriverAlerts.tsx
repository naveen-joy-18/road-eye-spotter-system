
import React, { useState, useEffect } from 'react';
import { Bell, Siren, Triangle, Flag, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface AlertConfig {
  type: string;
  enabled: boolean;
  distance: number; // Distance in meters
  soundEnabled: boolean;
}

export interface DriverAlert {
  id: string;
  type: 'pothole' | 'construction' | 'speedLimit' | 'traffic' | 'weather';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: { lat: number; lng: number };
  timestamp: Date;
  distanceAhead?: number; // in meters
  read?: boolean;
}

interface DriverAlertsProps {
  simulationActive?: boolean;
}

const DriverAlerts: React.FC<DriverAlertsProps> = ({ simulationActive = false }) => {
  const [alertSettings, setAlertSettings] = useState<AlertConfig[]>([
    { type: 'pothole', enabled: true, distance: 200, soundEnabled: true },
    { type: 'construction', enabled: true, distance: 500, soundEnabled: true },
    { type: 'speedLimit', enabled: true, distance: 300, soundEnabled: false },
    { type: 'traffic', enabled: true, distance: 1000, soundEnabled: true },
    { type: 'weather', enabled: true, distance: 5000, soundEnabled: false },
  ]);
  
  const [activeAlerts, setActiveAlerts] = useState<DriverAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<DriverAlert[]>([]);
  const [masterAlertSwitch, setMasterAlertSwitch] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Simulate receiving alerts during simulation
  useEffect(() => {
    if (!simulationActive || !masterAlertSwitch) return;
    
    const intervalId = setInterval(() => {
      // Only add new alerts if appropriate settings are enabled
      const enabledAlertTypes = alertSettings
        .filter(setting => setting.enabled)
        .map(setting => setting.type);
      
      if (enabledAlertTypes.length === 0) return;
      
      // Random alert type from enabled types
      const randomTypeIndex = Math.floor(Math.random() * enabledAlertTypes.length);
      const alertType = enabledAlertTypes[randomTypeIndex] as DriverAlert['type'];
      
      // Only proceed with 30% probability to avoid too many alerts
      if (Math.random() > 0.3) return;
      
      const severities: DriverAlert['severity'][] = ['low', 'medium', 'high'];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      
      const newAlert: DriverAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: alertType,
        severity: randomSeverity,
        message: getAlertMessage(alertType, randomSeverity),
        timestamp: new Date(),
        distanceAhead: Math.floor(Math.random() * 1000) + 100, // 100-1100 meters
        location: {
          lat: 20.5937 + (Math.random() - 0.5) * 0.02,
          lng: 78.9629 + (Math.random() - 0.5) * 0.02
        },
        read: false
      };
      
      // Check if the alert is within the configured distance
      const relevantSetting = alertSettings.find(setting => setting.type === alertType);
      if (relevantSetting && newAlert.distanceAhead && newAlert.distanceAhead <= relevantSetting.distance) {
        // Play sound if enabled for this alert type
        if (soundEnabled && relevantSetting.soundEnabled) {
          playAlertSound(randomSeverity);
        }
        
        // Show toast for high severity alerts
        if (randomSeverity === 'high') {
          toast.warning(`${getAlertTypeLabel(alertType)} Alert`, {
            description: `${newAlert.message} - ${newAlert.distanceAhead}m ahead`,
            icon: getAlertIcon(alertType, 16),
          });
        }
        
        // Add to active alerts and history
        setActiveAlerts(prev => [...prev, newAlert].slice(-5)); // Keep only last 5 alerts
        setAlertHistory(prev => [...prev, newAlert].slice(-20)); // Keep last 20 alerts in history
      }
    }, 8000); // Check for new alerts every 8 seconds
    
    return () => clearInterval(intervalId);
  }, [simulationActive, alertSettings, masterAlertSwitch, soundEnabled]);
  
  // Function to get an alert message based on type and severity
  const getAlertMessage = (type: DriverAlert['type'], severity: DriverAlert['severity']): string => {
    const messages = {
      pothole: {
        low: "Minor road damage ahead",
        medium: "Moderate pothole detected",
        high: "Critical pothole hazard ahead!"
      },
      construction: {
        low: "Road work zone approaching",
        medium: "Construction area ahead",
        high: "Major construction zone ahead!"
      },
      speedLimit: {
        low: "Speed limit change ahead",
        medium: "Reduce speed now",
        high: "Speed trap area!"
      },
      traffic: {
        low: "Light traffic ahead",
        medium: "Moderate traffic congestion",
        high: "Heavy traffic jam ahead!"
      },
      weather: {
        low: "Light rain conditions",
        medium: "Reduced visibility ahead",
        high: "Hazardous weather conditions!"
      }
    };
    
    return messages[type][severity];
  };
  
  // Get readable alert type
  const getAlertTypeLabel = (type: DriverAlert['type']): string => {
    const labels = {
      pothole: "Pothole",
      construction: "Construction",
      speedLimit: "Speed Limit",
      traffic: "Traffic",
      weather: "Weather"
    };
    return labels[type];
  };
  
  // Get icon for alert type
  const getAlertIcon = (type: DriverAlert['type'], size = 16) => {
    switch (type) {
      case 'pothole':
        return <AlertTriangle size={size} className="text-amber-500" />;
      case 'construction':
        return <Triangle size={size} className="text-orange-500" />;
      case 'speedLimit':
        return <Flag size={size} className="text-blue-500" />;
      case 'traffic':
        return <Siren size={size} className="text-red-500" />;
      case 'weather':
        return <Bell size={size} className="text-purple-500" />;
      default:
        return <AlertTriangle size={size} className="text-gray-500" />;
    }
  };
  
  // Get color for alert severity
  const getAlertSeverityColor = (severity: DriverAlert['severity']): string => {
    switch (severity) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-amber-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Play sound based on severity
  const playAlertSound = (severity: DriverAlert['severity']) => {
    // In a real app, you would play different sounds based on severity
    console.log(`Playing ${severity} alert sound`);
    // Example implementation would use the Web Audio API
  };
  
  // Toggle an alert type
  const toggleAlertType = (type: string) => {
    setAlertSettings(prev => 
      prev.map(setting => 
        setting.type === type 
          ? { ...setting, enabled: !setting.enabled } 
          : setting
      )
    );
  };
  
  // Toggle sound for an alert type
  const toggleAlertSound = (type: string) => {
    setAlertSettings(prev => 
      prev.map(setting => 
        setting.type === type 
          ? { ...setting, soundEnabled: !setting.soundEnabled } 
          : setting
      )
    );
  };
  
  // Mark an alert as read
  const markAlertAsRead = (id: string) => {
    setActiveAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, read: true } 
          : alert
      )
    );
    
    setAlertHistory(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, read: true } 
          : alert
      )
    );
  };
  
  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };
  
  const clearAllAlerts = () => {
    setActiveAlerts([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={masterAlertSwitch} 
            onCheckedChange={setMasterAlertSwitch} 
            id="driver-alerts-switch"
          />
          <label htmlFor="driver-alerts-switch" className="text-sm font-medium">
            Driver Alerts {masterAlertSwitch ? 'Enabled' : 'Disabled'}
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={soundEnabled} 
            onCheckedChange={setSoundEnabled} 
            id="sound-switch"
          />
          <label htmlFor="sound-switch" className="text-sm font-medium">
            Alert Sounds
          </label>
        </div>
      </div>
      
      {masterAlertSwitch && (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5 mb-4">
            {alertSettings.map(setting => (
              <div 
                key={setting.type} 
                className={`border rounded-md p-2 text-center transition-colors ${
                  setting.enabled ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {getAlertIcon(setting.type as DriverAlert['type'])}
                  <span className="ml-1 text-sm">{getAlertTypeLabel(setting.type as DriverAlert['type'])}</span>
                </div>
                <div className="flex justify-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={setting.enabled ? "default" : "outline"} 
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => toggleAlertType(setting.type)}
                        >
                          <Bell size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{setting.enabled ? 'Disable' : 'Enable'} alerts</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={setting.soundEnabled && setting.enabled ? "default" : "outline"} 
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={!setting.enabled}
                          onClick={() => toggleAlertSound(setting.type)}
                        >
                          {setting.soundEnabled ? '🔊' : '🔇'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{setting.soundEnabled ? 'Disable' : 'Enable'} sounds</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
          
          {activeAlerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center">
                  <Bell className="h-4 w-4 mr-1" />
                  Active Alerts ({activeAlerts.length})
                </h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllAlerts}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2">
                {activeAlerts.map(alert => (
                  <Alert key={alert.id} className="py-3 animate-fade-in">
                    <div className="flex items-start">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type, 18)}
                      </div>
                      <div className="ml-2 flex-1">
                        <AlertTitle className="flex items-center">
                          {getAlertTypeLabel(alert.type)}
                          <Badge 
                            className={`ml-2 ${getAlertSeverityColor(alert.severity)} text-white text-xs py-0`}
                          >
                            {alert.severity}
                          </Badge>
                          {alert.distanceAhead && (
                            <span className="ml-2 text-xs text-gray-500">
                              {alert.distanceAhead}m ahead
                            </span>
                          )}
                        </AlertTitle>
                        <AlertDescription>{alert.message}</AlertDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-full" 
                        onClick={() => dismissAlert(alert.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}
          
          {activeAlerts.length === 0 && simulationActive && (
            <div className="text-center py-8 border border-dashed rounded-md bg-gray-50">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No active alerts</p>
              <p className="text-xs text-gray-400 mt-1">
                Alerts will appear here as they're detected
              </p>
            </div>
          )}
          
          {!simulationActive && (
            <div className="text-center py-8 border border-dashed rounded-md bg-gray-50">
              <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Start simulation to receive alerts</p>
              <p className="text-xs text-gray-400 mt-1">
                Start the video analysis simulation to see driver alerts in action
              </p>
            </div>
          )}
        </>
      )}
      
      {!masterAlertSwitch && (
        <div className="text-center py-8 border border-dashed rounded-md bg-gray-50">
          <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2 opacity-50" />
          <p className="text-gray-500">Driver alerts are disabled</p>
          <p className="text-xs text-gray-400 mt-1">
            Toggle the switch above to enable alerts
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverAlerts;
