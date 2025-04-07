
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface MapInfoPanelProps {
  roadDamageStats: {
    total: number;
    critical: number;
    moderate: number;
    minor: number;
  };
}

export const MapInfoPanel: React.FC<MapInfoPanelProps> = ({ roadDamageStats }) => {
  return (
    <div className="absolute top-16 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-md shadow-md w-48">
      <h4 className="font-medium text-sm mb-2">Road Damage Report</h4>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs">Critical</span>
          <Badge variant="destructive" className="text-xs">{roadDamageStats.critical}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs">Moderate</span>
          <Badge variant="secondary" className="text-xs bg-yellow-500 hover:bg-yellow-600">{roadDamageStats.moderate}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs">Minor</span>
          <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">{roadDamageStats.minor}</Badge>
        </div>
      </div>
    </div>
  );
};
