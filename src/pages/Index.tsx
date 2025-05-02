
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ReportForm from '@/components/ReportForm';
import PotholeList from '@/components/PotholeList';
import Dashboard from '@/components/Dashboard';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DriverAlerts from '@/components/alerts/DriverAlerts';
import NavigationAlerts from '@/components/alerts/NavigationAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [simulationActive, setSimulationActive] = useState(false);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    document.title = "ROADSENSE AI - Road Monitoring System";
  }, []);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Tabs value={activeTab} className="w-full space-y-6" onValueChange={setActiveTab}>
        <TabsContent value="map" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full min-h-[400px] flex flex-col items-center justify-center bg-muted/30 p-6">
                <MapPin className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Road Map View</h2>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  The interactive map has been moved to the Chat section. You can access the detailed pothole heatmap via the "See Heatmap" button in the Chat tab.
                </p>
                <Button 
                  onClick={() => {
                    navigate('/video-analysis');
                    setTimeout(() => {
                      const chatTab = document.querySelector('[value="chat"]') as HTMLElement;
                      if (chatTab) chatTab.click();
                      toast.info("Navigate to the Heatmap button in the Chat section");
                    }, 100);
                  }} 
                  variant="default"
                >
                  Go to Heatmap Section
                </Button>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <PotholeList />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Driver Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DriverAlerts simulationActive={simulationActive} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="report" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ReportForm />
            </div>
            <div className="lg:col-span-1">
              <NavigationAlerts />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard" className="m-0">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="video" className="m-0">
          {/* This will be empty since video content is on VideoAnalysisPage */}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Index;
