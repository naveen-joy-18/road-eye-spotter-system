
import React, { useState } from 'react';
import VideoAnalysis from '@/components/VideoAnalysis';
import DriverAlerts from '@/components/alerts/DriverAlerts';
import DataManagement from '@/components/alerts/DataManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Database, Bell } from 'lucide-react';

const VideoAnalysisWithAlerts: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');

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
              <DriverAlerts simulationActive={isSimulating} />
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
