
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysisWithAlerts from '@/components/VideoAnalysisWithAlerts';
import { Toaster } from '@/components/ui/toaster';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

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
