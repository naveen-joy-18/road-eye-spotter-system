
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysisWithAlerts from '@/components/VideoAnalysisWithAlerts';
import { Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  // Ensure the layout knows this is the video tab
  useEffect(() => {
    document.title = "ROADSENSE AI - Video Analysis";
  }, []);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="video">Video Analysis</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="video">
            <VideoAnalysisWithAlerts />
          </TabsContent>
          <TabsContent value="map">
            {/* Map content will be rendered when this tab is active */}
          </TabsContent>
          <TabsContent value="report">
            {/* Report content will be rendered when this tab is active */}
          </TabsContent>
          <TabsContent value="dashboard">
            {/* Dashboard content will be rendered when this tab is active */}
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </Layout>
  );
};

export default VideoAnalysisPage;
