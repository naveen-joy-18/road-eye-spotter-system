
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysisWithAlerts from '@/components/VideoAnalysisWithAlerts';
import { Toaster } from 'sonner';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  // Ensure the layout knows this is the video tab
  useEffect(() => {
    setActiveTab('video');
  }, []);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="container mx-auto py-6">
        {/* Wrap content in Tabs component to ensure TabsContent is within Tabs */}
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="video">
            <VideoAnalysisWithAlerts />
          </TabsContent>
          {/* Add empty TabsContent for other tabs to prevent errors when switching */}
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
