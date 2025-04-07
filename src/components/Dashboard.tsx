
import React from 'react';
import { potholes } from '@/data/potholes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Clock, MapPin } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Calculate statistics
  const totalPotholes = potholes.length;
  const resolvedCount = potholes.filter(p => p.status === 'resolved').length;
  const highSeverityCount = potholes.filter(p => p.severity === 'high').length;
  const inProgressCount = potholes.filter(p => p.status === 'in_progress').length;
  
  const resolvedPercentage = totalPotholes > 0 ? (resolvedCount / totalPotholes) * 100 : 0;
  
  // Group potholes by status
  const statusCounts = {
    reported: potholes.filter(p => p.status === 'reported').length,
    confirmed: potholes.filter(p => p.status === 'confirmed').length,
    in_progress: inProgressCount,
    resolved: resolvedCount
  };
  
  // Group potholes by severity
  const severityCounts = {
    low: potholes.filter(p => p.severity === 'low').length,
    medium: potholes.filter(p => p.severity === 'medium').length,
    high: highSeverityCount
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Potholes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPotholes}</div>
            <p className="text-xs text-muted-foreground">
              {potholes.filter(p => {
                const date = new Date(p.reportedAt);
                const now = new Date();
                return date.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000;
              }).length} reported this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <Progress value={resolvedPercentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {resolvedPercentage.toFixed(0)}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highSeverityCount}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressCount} currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
            <p className="text-xs text-muted-foreground">
              From report to resolution
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="severity">By Severity</TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reported</span>
                <span className="font-medium">{statusCounts.reported}</span>
              </div>
              <Progress value={(statusCounts.reported / totalPotholes) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confirmed</span>
                <span className="font-medium">{statusCounts.confirmed}</span>
              </div>
              <Progress value={(statusCounts.confirmed / totalPotholes) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <span className="font-medium">{statusCounts.in_progress}</span>
              </div>
              <Progress value={(statusCounts.in_progress / totalPotholes) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resolved</span>
                <span className="font-medium">{statusCounts.resolved}</span>
              </div>
              <Progress value={(statusCounts.resolved / totalPotholes) * 100} className="h-2" />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="severity" className="mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Low</span>
                <span className="font-medium">{severityCounts.low}</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="absolute h-full bg-severity-low" 
                  style={{ width: `${(severityCounts.low / totalPotholes) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Medium</span>
                <span className="font-medium">{severityCounts.medium}</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="absolute h-full bg-severity-medium" 
                  style={{ width: `${(severityCounts.medium / totalPotholes) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High</span>
                <span className="font-medium">{severityCounts.high}</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="absolute h-full bg-severity-high" 
                  style={{ width: `${(severityCounts.high / totalPotholes) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
