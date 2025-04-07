
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface MapInfoPanelProps {
  roadDamageStats: {
    total: number;
    critical: number;
    moderate: number;
    minor: number;
  };
}

export const MapInfoPanel: React.FC<MapInfoPanelProps> = ({ roadDamageStats }) => {
  // Calculate percentages for visual representation
  const totalCount = roadDamageStats.total || 1; // Avoid division by zero
  const criticalPercent = Math.round((roadDamageStats.critical / totalCount) * 100);
  const moderatePercent = Math.round((roadDamageStats.moderate / totalCount) * 100);
  const minorPercent = Math.round((roadDamageStats.minor / totalCount) * 100);
  
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

  return (
    <div className="absolute top-16 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-md shadow-md w-60 border border-gray-200 animate-fade-in">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm mb-2">Road Damage Report</h4>
        <div className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-0.5">
          {getTrendIcon()}
          <span>{new Date().toLocaleDateString('en-IN')}</span>
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
          <Progress value={criticalPercent} className="h-1.5 bg-red-100" indicatorClassName="bg-severity-high" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium flex items-center">
              <div className="h-3 w-3 bg-severity-medium rounded-full mr-1.5"></div>
              Moderate
            </span>
            <Badge variant="secondary" className="text-xs bg-yellow-500 hover:bg-yellow-600">{roadDamageStats.moderate}</Badge>
          </div>
          <Progress value={moderatePercent} className="h-1.5 bg-yellow-100" indicatorClassName="bg-severity-medium" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium flex items-center">
              <div className="h-3 w-3 bg-severity-low rounded-full mr-1.5"></div>
              Minor
            </span>
            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">{roadDamageStats.minor}</Badge>
          </div>
          <Progress value={minorPercent} className="h-1.5 bg-green-100" indicatorClassName="bg-severity-low" />
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>Total Reports: <span className="font-medium">{roadDamageStats.total}</span></span>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Live Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
