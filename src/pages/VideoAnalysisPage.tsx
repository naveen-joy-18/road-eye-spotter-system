
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysis from '@/components/VideoAnalysis';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="container mx-auto max-w-5xl py-6">
        <VideoAnalysis />
      </div>
    </Layout>
  );
};

export default VideoAnalysisPage;
