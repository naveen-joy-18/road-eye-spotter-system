
import React, { useState, useEffect } from 'react';
import { AlertCircle, Bell, Volume2, Vibrate, Database, MapPin, ArrowRight, Car, GitMerge } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { speakAlertWithSeverity, cancelSpeech } from '@/utils/voiceAlert';

interface DriverAlertsProps {
  simulationActive: boolean;
}

type AlertType = 'visual' | 'audio' | 'vibration' | 'suspension';
type AlertDistance = 'near' | 'medium' | 'far';
type AlertSeverity = 'low' | 'medium' | 'high';

interface AlertSettings {
  types: Record<AlertType, boolean>;
  distance: AlertDistance;
  severityThreshold: AlertSeverity;
  audioVolume: number;
  vibrationIntensity: number;
  dataSharing: boolean;
  cloudSync: boolean;
  suspensionAdjustment: boolean;
}

const DEFAULT_SETTINGS: AlertSettings = {
  types: {
    visual: true,
    audio: true,
    vibration: false,
    suspension: false
  },
  distance: 'medium',
  severityThreshold: 'low',
  audioVolume: 70,
  vibrationIntensity: 50,
  dataSharing: true,
  cloudSync: true,
  suspensionAdjustment: false
};

const DriverAlerts: React.FC<DriverAlertsProps> = ({ simulationActive }) => {
  const [alertHistory, setAlertHistory] = useState<Array<{
    severity: AlertSeverity;
    time: Date;
    location?: { lat: number; lng: number };
    distance: number;
    responded: boolean;
  }>>([]);
  const [settings, setSettings] = useState<AlertSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastAlert, setLastAlert] = useState<Date | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [avoidedCount, setAvoidedCount] = useState(0);
  const [vibrating, setVibrating] = useState(false);

  // Generate a synthetic alert when simulation is active
  useEffect(() => {
    if (!simulationActive) return;
    
    const alertInterval = setInterval(() => {
      // Only create new alerts occasionally
      if (Math.random() > 0.3 || lastAlert && new Date().getTime() - lastAlert.getTime() < 8000) {
        return;
      }
      
      const severity: AlertSeverity = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as AlertSeverity;
      
      // Skip alerts that don't meet the severity threshold
      if (
        (settings.severityThreshold === 'medium' && severity === 'low') ||
        (settings.severityThreshold === 'high' && (severity === 'low' || severity === 'medium'))
      ) {
        return;
      }
      
      // Create the new alert
      const newAlert = {
        severity,
        time: new Date(),
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.05,
          lng: -74.006 + (Math.random() - 0.5) * 0.05
        },
        distance: Math.round(Math.random() * 100 + 20), // 20-120 meters
        responded: false
      };
      
      // Show an appropriate visual alert
      if (settings.types.visual) {
        const alertTitle = severity === 'high' ? 'Critical Pothole Ahead!' :
                         severity === 'medium' ? 'Moderate Pothole Ahead' :
                         'Minor Road Damage Ahead';
        
        const distanceText = 
          settings.distance === 'far' ? `${newAlert.distance}m ahead` :
          settings.distance === 'medium' ? `${newAlert.distance}m ahead` :
          `${newAlert.distance}m ahead`;
                         
        toast[severity === 'high' ? 'error' : 
              severity === 'medium' ? 'warning' : 'info'](
          alertTitle,
          {
            description: `${distanceText}. ${
              severity === 'high' ? 'Immediate action required!' : 
              severity === 'medium' ? 'Prepare to slow down.' : 
              'Monitor road conditions.'
            }`,
            position: 'top-right',
            duration: 5000,
            icon: <AlertCircle className={`h-5 w-5 ${
              severity === 'high' ? 'text-red-500' :
              severity === 'medium' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
          }
        );
      }
      
      // Play audio alert
      if (settings.types.audio) {
        const alertText = severity === 'high' ? 'Critical pothole ahead! Slow down immediately!' :
                       severity === 'medium' ? 'Moderate pothole detected ahead. Prepare to slow down.' :
                       'Minor road damage ahead. Proceed with caution.';
        
        speakAlertWithSeverity(alertText, severity);
      }
      
      // Vibration feedback
      if (settings.types.vibration) {
        setVibrating(true);
        // Simulate vibration by adding CSS class to the alert container
        setTimeout(() => setVibrating(false), 2000);
      }

      // Suspension adjustment simulation
      if (settings.types.suspension && settings.suspensionAdjustment) {
        toast.info("Suspension adjusted", {
          description: "Vehicle suspension automatically adjusted for optimal comfort",
          icon: <Car className="h-5 w-5" />,
          position: "bottom-center"
        });
      }
      
      // Update state
      setLastAlert(new Date());
      setAlertCount(prev => prev + 1);
      setAlertHistory(prev => [newAlert, ...prev].slice(0, 10));
      
      // Simulate whether driver responded to the alert
      setTimeout(() => {
        const didRespond = Math.random() > 0.2; // 80% response rate
        
        setAlertHistory(prev => 
          prev.map((alert, i) => 
            i === 0 ? { ...alert, responded: didRespond } : alert
          )
        );
        
        if (didRespond) {
          setAvoidedCount(prev => prev + 1);
        }
      }, 3000);
      
      // Simulate data sharing if enabled
      if (settings.dataSharing) {
        setTimeout(() => {
          toast.success("Pothole data shared", {
            description: "Information shared with nearby vehicles and city services",
            duration: 2000,
            position: "bottom-right",
            icon: <GitMerge className="h-5 w-5" />
          });
        }, 4000);
      }
      
    }, 3000);
    
    return () => clearInterval(alertInterval);
  }, [simulationActive, lastAlert, settings]);

  const handleAlertTypeToggle = (type: AlertType) => {
    setSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
    
    toast.info(`${!settings.types[type] ? 'Enabled' : 'Disabled'} ${type} alerts`);
  };

  const handleDistanceChange = (distance: AlertDistance) => {
    setSettings(prev => ({
      ...prev,
      distance
    }));
    
    const distanceText = 
      distance === 'far' ? 'Far (100+ meters)' :
      distance === 'medium' ? 'Medium (50-100 meters)' :
      'Near (under 50 meters)';
    
    toast.info(`Alert distance set to ${distanceText}`);
  };

  const handleSeverityChange = (severityThreshold: AlertSeverity) => {
    setSettings(prev => ({
      ...prev,
      severityThreshold
    }));
    
    toast.info(`Minimum severity set to ${severityThreshold}`);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info("Alert settings reset to defaults");
  };

  const severityColor = (severity: AlertSeverity) => 
    severity === 'high' ? 'bg-red-500' :
    severity === 'medium' ? 'bg-yellow-500' : 
    'bg-green-500';

  return (
    <div className={`space-y-4 ${vibrating ? 'animate-pulse' : ''}`}>
      {!simulationActive ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Bell className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-lg font-medium mb-1">Driver Alerts Standby</p>
          <p className="text-sm text-muted-foreground mb-4">Start the video simulation to activate alerts</p>
          <Badge variant="outline" className="text-xs">Not Active</Badge>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className={`h-5 w-5 mr-2 ${lastAlert && new Date().getTime() - lastAlert.getTime() < 5000 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
              <span className="font-medium">Alert System</span>
            </div>
            <Badge variant="outline" className="animate-pulse text-xs">
              Active
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/20 p-2 rounded text-center">
              <div className="text-xs text-muted-foreground">Total Alerts</div>
              <div className="text-xl font-bold">{alertCount}</div>
            </div>
            <div className="bg-muted/20 p-2 rounded text-center">
              <div className="text-xs text-muted-foreground">Avoided</div>
              <div className="text-xl font-bold">{avoidedCount}</div>
            </div>
          </div>
          
          {alertHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent Alerts</span>
                <button 
                  onClick={() => setAlertHistory([])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {alertHistory.map((alert, i) => (
                  <div key={i} className={`p-2 rounded-md border text-xs ${i === 0 ? 'bg-muted/20 border-primary' : 'border-muted'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${severityColor(alert.severity)}`}></div>
                        <span className="font-medium">
                          {alert.severity === 'high' ? 'Critical' : 
                          alert.severity === 'medium' ? 'Moderate' : 
                          'Minor'} Alert
                        </span>
                      </div>
                      <span>{alert.distance}m</span>
                    </div>
                    <div className="flex justify-between mt-1 text-muted-foreground">
                      <span>
                        {new Date(alert.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                      </span>
                      <span>{alert.responded ? 'Avoided' : 'Missed'}</span>
                    </div>
                    {alert.location && (
                      <div className="mt-1 flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <Button 
          variant={settingsOpen ? "default" : "outline"} 
          size="sm" 
          className="w-full flex items-center justify-between" 
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <span>Alert Settings</span>
          <ArrowRight className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
        </Button>
        {settingsOpen && (
          <div className="mt-4 space-y-4 border rounded-md p-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Alert Types</h4>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <label className="text-sm">Visual Alerts</label>
                </div>
                <Switch 
                  checked={settings.types.visual} 
                  onCheckedChange={() => handleAlertTypeToggle('visual')} 
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Volume2 className="h-4 w-4 mr-2" />
                  <label className="text-sm">Audio Alerts</label>
                </div>
                <Switch 
                  checked={settings.types.audio} 
                  onCheckedChange={() => handleAlertTypeToggle('audio')} 
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Vibrate className="h-4 w-4 mr-2" />
                  <label className="text-sm">Vibration Feedback</label>
                </div>
                <Switch 
                  checked={settings.types.vibration} 
                  onCheckedChange={() => handleAlertTypeToggle('vibration')} 
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  <label className="text-sm">Suspension Adjustment</label>
                </div>
                <Switch 
                  checked={settings.types.suspension} 
                  onCheckedChange={() => handleAlertTypeToggle('suspension')} 
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Alert Distance</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  size="sm"
                  variant={settings.distance === 'near' ? "default" : "outline"}
                  onClick={() => handleDistanceChange('near')}
                  className="text-xs"
                >
                  Near
                </Button>
                <Button 
                  size="sm"
                  variant={settings.distance === 'medium' ? "default" : "outline"}
                  onClick={() => handleDistanceChange('medium')}
                  className="text-xs"
                >
                  Medium
                </Button>
                <Button 
                  size="sm"
                  variant={settings.distance === 'far' ? "default" : "outline"}
                  onClick={() => handleDistanceChange('far')}
                  className="text-xs"
                >
                  Far
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {settings.distance === 'near' ? 'Alert when < 50m from pothole' : 
                 settings.distance === 'medium' ? 'Alert when 50-100m from pothole' :
                 'Alert when > 100m from pothole'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Minimum Severity</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  size="sm"
                  variant={settings.severityThreshold === 'low' ? "default" : "outline"}
                  onClick={() => handleSeverityChange('low')}
                  className="text-xs"
                >
                  Low
                </Button>
                <Button 
                  size="sm"
                  variant={settings.severityThreshold === 'medium' ? "default" : "outline"}
                  onClick={() => handleSeverityChange('medium')}
                  className="text-xs"
                >
                  Medium
                </Button>
                <Button 
                  size="sm"
                  variant={settings.severityThreshold === 'high' ? "default" : "outline"}
                  onClick={() => handleSeverityChange('high')}
                  className="text-xs"
                >
                  High
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Audio Volume</label>
                <span className="text-sm">{settings.audioVolume}%</span>
              </div>
              <Slider 
                value={[settings.audioVolume]} 
                min={0} 
                max={100} 
                step={5}
                onValueChange={(value) => {
                  setSettings(prev => ({ ...prev, audioVolume: value[0] }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Vibration Intensity</label>
                <span className="text-sm">{settings.vibrationIntensity}%</span>
              </div>
              <Slider 
                value={[settings.vibrationIntensity]} 
                min={0} 
                max={100} 
                step={5}
                onValueChange={(value) => {
                  setSettings(prev => ({ ...prev, vibrationIntensity: value[0] }));
                }}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Data Management</h4>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  <label className="text-sm">Cloud Sync</label>
                </div>
                <Switch 
                  checked={settings.cloudSync} 
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, cloudSync: checked }));
                    toast.info(`Cloud sync ${checked ? 'enabled' : 'disabled'}`);
                  }} 
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <GitMerge className="h-4 w-4 mr-2" />
                  <label className="text-sm">Data Sharing</label>
                </div>
                <Switch 
                  checked={settings.dataSharing} 
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, dataSharing: checked }));
                    toast.info(`Data sharing ${checked ? 'enabled' : 'disabled'}`);
                  }} 
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  <label className="text-sm">Suspension Adjustment</label>
                </div>
                <Switch 
                  checked={settings.suspensionAdjustment} 
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, suspensionAdjustment: checked }));
                    toast.info(`Suspension adjustment ${checked ? 'enabled' : 'disabled'}`);
                  }} 
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                Reset to Defaults
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Example alert for when simulation is active */}
      {simulationActive && lastAlert && new Date().getTime() - lastAlert.getTime() < 5000 && (
        <Alert className="border-l-4 border-red-500 animate-pulse">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pothole Alert</AlertTitle>
          <AlertDescription className="text-sm">
            {alertHistory.length > 0 ? `${alertHistory[0].distance}m ahead, ${
              alertHistory[0].severity === 'high' ? 'critical severity' :
              alertHistory[0].severity === 'medium' ? 'moderate severity' :
              'low severity'
            }` : 'Road hazard detected'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DriverAlerts;
