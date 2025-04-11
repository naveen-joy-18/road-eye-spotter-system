
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BarChart3, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface MapInfoPanelProps {
  roadDamageStats: {
    total: number;
    critical: number;
    moderate: number;
    minor: number;
  };
}

// Updated to use Indian cities
const INDIAN_CITIES = [
  { name: "Delhi", count: 57 },
  { name: "Mumbai", count: 48 },
  { name: "Bangalore", count: 35 },
  { name: "Chennai", count: 29 },
  { name: "Kolkata", count: 31 },
  { name: "Hyderabad", count: 26 },
  { name: "Pune", count: 22 },
  { name: "Ahmedabad", count: 19 },
  { name: "Jaipur", count: 15 },
  { name: "Lucknow", count: 13 }
];

export const MapInfoPanel: React.FC<MapInfoPanelProps> = ({ roadDamageStats }) => {
  // Calculate percentages for visual representation
  const totalCount = roadDamageStats.total || 1; // Avoid division by zero
  const criticalPercent = Math.round((roadDamageStats.critical / totalCount) * 100);
  const moderatePercent = Math.round((roadDamageStats.moderate / totalCount) * 100);
  const minorPercent = Math.round((roadDamageStats.minor / totalCount) * 100);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [topCities, setTopCities] = useState(INDIAN_CITIES.slice(0, 5));
  
  // Determine the trend icon based on which category has the highest count
  const getTrendIcon = () => {
    if (roadDamageStats.critical >= roadDamageStats.moderate && 
        roadDamageStats.critical >= roadDamageStats.minor) {
      return <TrendingUp className="h-3 w-3 text-severity-high" />;
    } else if (roadDamageStats.moderate >= roadDamageStats.critical && 
               roadDamageStats.moderate >= roadDamageStats.minor) {
      return <TrendingDown className="h-3 w-3 text-severity-medium" />;
    } else {
      return <TrendingDown className="h-3 w-3 text-severity-low" />;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
      // Shuffle the cities to simulate updated data
      setTopCities([...INDIAN_CITIES]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .sort((a, b) => b.count - a.count)
      );
      toast.success("Road damage data refreshed");
    }, 1200);
  };

  return (
    <div className="absolute top-16 left-4 map-overlay p-4 rounded-md shadow-md w-64 border border-gray-500/20 animate-fade-in z-20">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm mb-2">Road Damage Report</h4>
        <div className="flex items-center gap-1 text-xs bg-background/70 rounded-full px-2 py-0.5">
          {getTrendIcon()}
          <span>{lastUpdated.toLocaleDateString('en-IN')}</span>
        </div>
      </div>
      
      <div className="space-y-3 mt-2">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium flex items-center">
              <div className="h-3 w-3 bg-severity-high rounded-full mr-1.5"></div>
              Critical
            </span>
            <Badge variant="destructive" className="text-xs">{roadDamageStats.critical}</Badge>
          </div>
          <Progress value={criticalPercent} className="h-1.5 bg-red-900/30" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium flex items-center">
              <div className="h-3 w-3 bg-severity-medium rounded-full mr-1.5"></div>
              Moderate
            </span>
            <Badge variant="secondary" className="text-xs bg-yellow-500 hover:bg-yellow-600">{roadDamageStats.moderate}</Badge>
          </div>
          <Progress value={moderatePercent} className="h-1.5 bg-yellow-900/30" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium flex items-center">
              <div className="h-3 w-3 bg-severity-low rounded-full mr-1.5"></div>
              Minor
            </span>
            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">{roadDamageStats.minor}</Badge>
          </div>
          <Progress value={minorPercent} className="h-1.5 bg-green-900/30" />
        </div>
      </div>
      
      {/* Added section for top cities reporting */}
      <div className="mt-4 border-t border-gray-500/20 pt-3">
        <h5 className="text-xs font-semibold mb-2 flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          Top Cities Reporting
        </h5>
        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {topCities.map((city, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span>{city.name}</span>
              <span className="font-mono bg-background/70 px-1.5 py-0.5 rounded">{city.count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-500/20">
        <div className="flex justify-between items-center text-xs">
          <span>Total Reports: <span className="font-medium">{roadDamageStats.total}</span></span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="p-1 h-auto" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
