
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysisWithAlerts from '@/components/VideoAnalysisWithAlerts';
import Map from '@/components/Map';
import { Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  // Ensure the layout knows this is the video tab
  useEffect(() => {
    document.title = "ROADSENSE AI - Video Analysis";
  }, []);

  // Use a temporary API key for demonstration (in a real app, this would come from environment variables)
  const dummyApiKey = "demo-map-api-key";

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="video">Video Analysis</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="video" className="m-0 animate-in fade-in-50">
            <VideoAnalysisWithAlerts />
          </TabsContent>
          
          <TabsContent value="map" className="m-0 animate-in fade-in-50">
            <Map googleMapsApiKey={dummyApiKey} />
          </TabsContent>
          
          <TabsContent value="report" className="m-0 animate-in fade-in-50">
            <div className="bg-white p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Report Module</h2>
              <p className="text-gray-500">Coming soon - Road damage reporting system</p>
            </div>
          </TabsContent>
          
          <TabsContent value="dashboard" className="m-0 animate-in fade-in-50">
            <div className="bg-white p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
              <p className="text-gray-500">Coming soon - Advanced analytics and reporting</p>
            </div>
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </Layout>
  );
};

export default VideoAnalysisPage;
