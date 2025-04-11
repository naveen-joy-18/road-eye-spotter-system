
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VideoAnalysisWithAlerts from '@/components/VideoAnalysisWithAlerts';
import Map from '@/components/Map';
import ReportForm from '@/components/ReportForm';
import PotholeChatBot from '@/components/PotholeChatBot';
import { toast, Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video');

  useEffect(() => {
    document.title = "ROADSENSE AI - Video Analysis";
  }, []);

  useEffect(() => {
    if (activeTab === 'video') {
      toast.info("Video Analysis Module Loaded", {
        description: "Upload a video or use our demo to analyze road conditions with our AI backend"
      });
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'report') {
      toast.info("Welcome to the Report Module", {
        description: "Report potholes and road damage in your area"
      });
    } else if (value === 'dashboard') {
      toast.info("Analytics Dashboard", {
        description: "View trends and statistics about road conditions"
      });
    } else if (value === 'map') {
      toast.info("Interactive Map View", {
        description: "Visualize pothole locations across India"
      });
    } else if (value === 'video') {
      toast.info("Video Analysis Module", {
        description: "Analyze road videos for potholes using our Python-powered AI"
      });
    }
  };

  const dummyApiKey = "demo-map-api-key";

  return (
    <Layout activeTab="video" onTabChange={(tab) => setActiveTab(tab)}>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="video" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            <TabsTrigger value="video">Video Analysis</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              AI Chat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="video" className="mt-4 animate-in fade-in-50">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gradient">Road Condition Video Analysis</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => toast.info("Documentation opened in new tab")}>
                  Help Guide
                </Button>
                <Button onClick={() => toast.success("Analysis settings saved")}>
                  Settings
                </Button>
              </div>
            </div>
            <Alert className="mb-4 bg-card border-border">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>AI-Powered Pothole Detection</AlertTitle>
              <AlertDescription className="text-prevent-overlap">
                Our advanced AI detection system uses Cerebras AI and computer vision to analyze road videos 
                and detect potholes with high precision. Upload a video or use our demo to see it in action.
              </AlertDescription>
            </Alert>
            <VideoAnalysisWithAlerts />
          </TabsContent>
          
          <TabsContent value="map" className="mt-4 animate-in fade-in-50">
            <Map googleMapsApiKey={dummyApiKey} />
          </TabsContent>
          
          <TabsContent value="report" className="mt-4 animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border space-y-4">
                <h2 className="text-2xl font-bold mb-4">Report Road Damage</h2>
                <Alert className="bg-background border-border">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Help improve Indian roads</AlertTitle>
                  <AlertDescription>
                    Your reports help local authorities identify and fix road damage across India.
                  </AlertDescription>
                </Alert>
                <ReportForm />
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-bold mb-4">Recently Reported Issues</h2>
                <div className="space-y-3">
                  {[
                    { location: "Connaught Place, Delhi", severity: "high", date: "2025-04-09", size: "large" },
                    { location: "MG Road, Bangalore", severity: "medium", date: "2025-04-08", size: "medium" },
                    { location: "Marine Drive, Mumbai", severity: "low", date: "2025-04-07", size: "small" },
                    { location: "Anna Salai, Chennai", severity: "high", date: "2025-04-06", size: "medium" },
                    { location: "Park Street, Kolkata", severity: "medium", date: "2025-04-05", size: "large" }
                  ].map((report, index) => (
                    <div key={index} className={`p-3 rounded-md border ${
                      report.severity === 'high' ? 'border-red-500/30 bg-red-950/20' :
                      report.severity === 'medium' ? 'border-yellow-500/30 bg-yellow-950/20' :
                      'border-green-500/30 bg-green-950/20'
                    }`}>
                      <div className="flex justify-between">
                        <span className="font-medium text-sm">{report.location}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          report.severity === 'high' ? 'bg-red-500 text-white' :
                          report.severity === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-green-500 text-white'
                        }`}>{report.severity}</span>
                      </div>
                      <div className="text-xs mt-1 text-muted-foreground flex justify-between">
                        <span>Reported: {report.date}</span>
                        <span>Size: {report.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-4 animate-in fade-in-50">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-6 text-gradient">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 bg-blue-950/20 border-blue-500/30">
                  <h3 className="font-medium text-lg mb-2">Top Affected Areas</h3>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Delhi - 87 reports</li>
                    <li>Mumbai - 72 reports</li>
                    <li>Bangalore - 65 reports</li>
                    <li>Chennai - 58 reports</li>
                    <li>Kolkata - 52 reports</li>
                  </ol>
                </div>
                <div className="border rounded-lg p-4 bg-amber-950/20 border-amber-500/30">
                  <h3 className="font-medium text-lg mb-2">Severity Distribution</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Critical</span>
                        <span>28%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Moderate</span>
                        <span>45%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Minor</span>
                        <span>27%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '27%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-green-950/20 border-green-500/30">
                  <h3 className="font-medium text-lg mb-2">Monthly Trend</h3>
                  <div className="h-40 flex items-end justify-between gap-2">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => {
                      const height = [40, 65, 45, 80, 60, 30][index];
                      return (
                        <div key={month} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-green-600 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs mt-1">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="mt-4 animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <PotholeChatBot />
              </div>
              <div className="md:col-span-1">
                <div className="bg-card p-6 rounded-lg border border-border h-full">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 gradient-text">
                    <Bot className="h-5 w-5 text-primary" />
                    About AI Pothole Chat
                  </h3>
                  
                  <div className="space-y-4">
                    <p>
                      Our AI assistant is powered by Cerebras AI and specialized in all things related to potholes 
                      and road damage. Feel free to ask questions about:
                    </p>
                    
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Causes and formation of potholes</li>
                      <li>Detection technologies and methods</li>
                      <li>Prevention and repair techniques</li>
                      <li>Impact on vehicles and traffic safety</li>
                      <li>Government policies and reporting systems</li>
                    </ul>
                    
                    <Alert className="mt-4 bg-background border-border">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Integrated AI System</AlertTitle>
                      <AlertDescription>
                        This chatbot uses the same AI technology that powers our pothole detection system,
                        providing you with accurate and technical insights about road damage.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </Layout>
  );
};

export default VideoAnalysisPage;
