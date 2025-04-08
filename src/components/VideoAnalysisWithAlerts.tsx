
import React, { useState } from 'react';
import VideoAnalysis from '@/components/VideoAnalysis';
import DriverAlerts from '@/components/alerts/DriverAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VideoAnalysisWithAlerts: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulationChange = (simulating: boolean) => {
    setIsSimulating(simulating);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <VideoAnalysis onSimulationChange={handleSimulationChange} />
      </div>
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Driver Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DriverAlerts simulationActive={isSimulating} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoAnalysisWithAlerts;
