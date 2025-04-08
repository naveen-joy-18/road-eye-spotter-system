
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Map from '@/components/Map';
import ReportForm from '@/components/ReportForm';
import PotholeList from '@/components/PotholeList';
import Dashboard from '@/components/Dashboard';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DriverAlerts from '@/components/alerts/DriverAlerts';
import NavigationAlerts from '@/components/alerts/NavigationAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Tabs value={activeTab} className="w-full space-y-6" onValueChange={setActiveTab}>
        <TabsContent value="map" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Map />
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
                  <DriverAlerts />
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
      </Tabs>
    </Layout>
  );
};

export default Index;
