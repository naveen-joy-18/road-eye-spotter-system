
import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-24 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-severity-high rounded-full mr-1.5"></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-severity-medium rounded-full mr-1.5"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-severity-low rounded-full mr-1.5"></div>
          <span>Minor</span>
        </div>
      </div>
    </div>
  );
};
