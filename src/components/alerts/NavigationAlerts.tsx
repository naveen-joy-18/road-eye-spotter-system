
import React, { useState } from 'react';
import { Flag, MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { speakAlertWithSeverity } from '@/utils/voiceAlert';
import { Slider } from '@/components/ui/slider';

interface NavigationAlertsProps {
  enabled?: boolean;
}

const NavigationAlerts: React.FC<NavigationAlertsProps> = ({ enabled = true }) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [alertDistance, setAlertDistance] = useState(200);
  const [destination, setDestination] = useState('');
  const [routeActive, setRouteActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const handleTestVoiceAlert = () => {
    if (voiceEnabled) {
      speakAlertWithSeverity("Warning: Critical pothole ahead. Reduce speed now.", "high");
    }
  };

  const handleActivateRoute = () => {
    if (!destination.trim()) {
      return;
    }
    
    setRouteActive(true);
    
    if (voiceEnabled) {
      speakAlertWithSeverity(`Navigation started to ${destination}. Road hazards will be reported.`, "medium");
    }
  };

  const handleDeactivateRoute = () => {
    setRouteActive(false);
    
    if (voiceEnabled) {
      speakAlertWithSeverity("Navigation ended", "low");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          Navigation Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={isEnabled} 
              onCheckedChange={setIsEnabled} 
              id="navigation-alerts-switch"
            />
            <label htmlFor="navigation-alerts-switch" className="text-sm font-medium">
              Navigation Alerts
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              checked={voiceEnabled} 
              onCheckedChange={setVoiceEnabled} 
              id="voice-switch"
              disabled={!isEnabled}
            />
            <label htmlFor="voice-switch" className="text-sm font-medium">
              Voice
            </label>
          </div>
        </div>
        
        {isEnabled && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alert Distance</label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[alertDistance]}
                  min={50}
                  max={500}
                  step={10}
                  className="flex-1"
                  onValueChange={(values) => setAlertDistance(values[0])}
                />
                <span className="text-sm font-mono w-16 text-right">{alertDistance}m</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert distance before reaching hazards
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={routeActive}
                />
                {!routeActive ? (
                  <Button onClick={handleActivateRoute} disabled={!destination.trim()}>
                    Start
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={handleDeactivateRoute}>
                    Stop
                  </Button>
                )}
              </div>
            </div>
            
            {routeActive ? (
              <div className="border border-primary/20 bg-primary/5 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-2" />
                    <span className="font-medium">{destination}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10">Active</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Hazards within {alertDistance}m will trigger alerts
                </div>
                
                <div className="mt-3 flex items-center text-sm">
                  <Flag className="h-4 w-4 text-green-500 mr-1" />
                  <span>Ready to detect road hazards</span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center">
                <Navigation className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Enter a destination and start navigation to receive road hazard alerts
                </p>
                <Button variant="link" size="sm" onClick={handleTestVoiceAlert}>
                  Test voice alert
                </Button>
              </div>
            )}
          </>
        )}
        
        {!isEnabled && (
          <div className="border border-dashed rounded-md p-4 text-center">
            <Navigation className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Enable navigation alerts to receive voice notifications about road hazards
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NavigationAlerts;
