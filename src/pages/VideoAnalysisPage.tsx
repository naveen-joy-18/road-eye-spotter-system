
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysisWithAlerts from '@/components/VideoAnalysisWithAlerts';
import { Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  // Ensure the layout knows this is the video tab
  useEffect(() => {
    setActiveTab('video');
    document.title = "ROADSENSE AI - Video Analysis";
  }, []);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="container mx-auto py-6">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="video">
            <VideoAnalysisWithAlerts />
          </TabsContent>
          <TabsContent value="map" />
          <TabsContent value="report" />
          <TabsContent value="dashboard" />
        </Tabs>
        <Toaster />
      </div>
    </Layout>
  );
};

export default VideoAnalysisPage;
