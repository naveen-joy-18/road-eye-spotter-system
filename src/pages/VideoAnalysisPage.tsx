
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysisWithAlerts from '@/components/VideoAnalysisWithAlerts';
import { Toaster } from 'sonner';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  // Ensure the layout knows this is the video tab
  useEffect(() => {
    setActiveTab('video');
  }, []);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="container mx-auto py-6">
        <VideoAnalysisWithAlerts />
        <Toaster />
      </div>
    </Layout>
  );
};

export default VideoAnalysisPage;
