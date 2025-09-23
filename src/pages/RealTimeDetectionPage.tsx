// Real-time Detection Page
import React from 'react';
import Layout from '@/components/Layout';
import RealTimeDetection from '@/components/RealTimeDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Zap } from 'lucide-react';

const RealTimeDetectionPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "ROADSENSE AI - Real-time Detection";
  }, []);

  return (
    <Layout activeTab="realtime" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Real-time Pothole Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm">YOLO-powered detection</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Use your device camera to detect potholes in real-time while driving
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Detection Component */}
        <RealTimeDetection />
      </div>
    </Layout>
  );
};

export default RealTimeDetectionPage;