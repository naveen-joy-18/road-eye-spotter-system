
import React, { useState, useEffect } from 'react';
import { Database, Share2, Cloud, RefreshCw, Download, Upload, Map, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Severity } from '@/types';

interface DataManagementProps {
  simulationActive: boolean;
}

interface PotholeDataSummary {
  totalRecorded: number;
  verified: number;
  sharedWithAuthorities: number;
  sharedWithDrivers: number;
  severityBreakdown: Record<Severity, number>;
  storageUsed: number;
  lastSync: Date | null;
  syncProgress: number;
}

const DataManagement: React.FC<DataManagementProps> = ({ simulationActive }) => {
  const [dataSummary, setDataSummary] = useState<PotholeDataSummary>({
    totalRecorded: 0,
    verified: 0,
    sharedWithAuthorities: 0,
    sharedWithDrivers: 0,
    severityBreakdown: {
      low: 0,
      medium: 0,
      high: 0,
    },
    storageUsed: 0,
    lastSync: null,
    syncProgress: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Simulate data collection when simulation is active
  useEffect(() => {
    if (!simulationActive) return;
    
    const dataInterval = setInterval(() => {
      setDataSummary(prev => {
        // Randomly increment counts
        const newPotholes = Math.floor(Math.random() * 2);
        const severityDistribution = ['low', 'medium', 'high'] as const;
        const newSeverity = severityDistribution[Math.floor(Math.random() * 3)];
        
        // Update severity breakdown
        const severityBreakdown = { ...prev.severityBreakdown };
        if (newPotholes > 0) {
          severityBreakdown[newSeverity] += newPotholes;
        }
        
        // Sometimes share data with authorities or drivers
        const shareWithAuthorities = Math.random() > 0.7 && newPotholes > 0;
        const shareWithDrivers = Math.random() > 0.5 && newPotholes > 0;
        
        // Calculate storage used (1MB per pothole for simplicity)
        const storageUsed = Math.min(500, prev.storageUsed + (newPotholes * 1));
        
        return {
          ...prev,
          totalRecorded: prev.totalRecorded + newPotholes,
          verified: prev.verified + (Math.random() > 0.3 ? newPotholes : 0),
          sharedWithAuthorities: shareWithAuthorities 
            ? prev.sharedWithAuthorities + newPotholes 
            : prev.sharedWithAuthorities,
          sharedWithDrivers: shareWithDrivers 
            ? prev.sharedWithDrivers + newPotholes 
            : prev.sharedWithDrivers,
          severityBreakdown,
          storageUsed,
        };
      });
    }, 5000);
    
    return () => clearInterval(dataInterval);
  }, [simulationActive]);

  const handleSync = () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    toast.info("Syncing data to cloud", {
      description: "Uploading pothole data to shared database",
    });
    
    let progress = 0;
    const syncInterval = setInterval(() => {
      progress += Math.random() * 10;
      setDataSummary(prev => ({
        ...prev,
        syncProgress: Math.min(100, progress)
      }));
      
      if (progress >= 100) {
        clearInterval(syncInterval);
        setIsSyncing(false);
        setDataSummary(prev => ({
          ...prev,
          lastSync: new Date(),
          syncProgress: 0
        }));
        toast.success("Data sync complete", {
          description: "All pothole data successfully uploaded to cloud"
        });
      }
    }, 500);
  };

  const handleExportData = () => {
    toast.info("Exporting data", {
      description: "Preparing CSV export of pothole data"
    });
    
    setTimeout(() => {
      toast.success("Export ready", {
        description: "Data exported as pothole_data.csv"
      });
    }, 1500);
  };

  const handleShareWithAuthorities = () => {
    toast.info("Sharing with authorities", {
      description: "Sending pothole data to road maintenance agencies"
    });
    
    setTimeout(() => {
      setDataSummary(prev => ({
        ...prev,
        sharedWithAuthorities: prev.totalRecorded
      }));
      
      toast.success("Data shared successfully", {
        description: "Road maintenance agencies notified of pothole locations"
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Data Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-muted/20 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Total Recorded</div>
                <div className="text-xl font-bold">{dataSummary.totalRecorded}</div>
              </div>
              <div className="bg-muted/20 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Verified</div>
                <div className="text-xl font-bold">{dataSummary.verified}</div>
                <div className="text-xs text-muted-foreground">
                  {dataSummary.totalRecorded > 0 
                    ? `(${Math.round((dataSummary.verified / dataSummary.totalRecorded) * 100)}%)`
                    : '(0%)'}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Severity Distribution</h4>
              <div className="space-y-2">
                {['high', 'medium', 'low'].map((severity) => {
                  const count = dataSummary.severityBreakdown[severity as Severity];
                  const percentage = dataSummary.totalRecorded > 0 
                    ? (count / dataSummary.totalRecorded) * 100
                    : 0;
                  
                  return (
                    <div key={severity} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize">{severity}</span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`absolute h-full rounded-full ${
                            severity === 'high' ? 'bg-red-500' :
                            severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium">Last Sync</h4>
                <div className="text-xs text-muted-foreground">
                  {dataSummary.lastSync 
                    ? new Date(dataSummary.lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                    : 'Never'}
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full" 
                onClick={handleSync} 
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              
              {isSyncing && (
                <div className="space-y-1">
                  <Progress value={dataSummary.syncProgress} />
                  <div className="text-xs text-right">{Math.round(dataSummary.syncProgress)}%</div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sharing" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/20 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Shared with Authorities</div>
                <div className="text-xl font-bold">{dataSummary.sharedWithAuthorities}</div>
                <div className="text-xs text-muted-foreground">
                  {dataSummary.totalRecorded > 0 
                    ? `(${Math.round((dataSummary.sharedWithAuthorities / dataSummary.totalRecorded) * 100)}%)`
                    : '(0%)'}
                </div>
              </div>
              <div className="bg-muted/20 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Shared with Drivers</div>
                <div className="text-xl font-bold">{dataSummary.sharedWithDrivers}</div>
                <div className="text-xs text-muted-foreground">
                  {dataSummary.totalRecorded > 0 
                    ? `(${Math.round((dataSummary.sharedWithDrivers / dataSummary.totalRecorded) * 100)}%)`
                    : '(0%)'}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Data Sharing Options</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={handleShareWithAuthorities}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span className="text-xs">Share with Authorities</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    toast.info("Sharing with nearby drivers", {
                      description: "Broadcasting pothole locations to vehicles in the area"
                    });
                    
                    setTimeout(() => {
                      setDataSummary(prev => ({
                        ...prev,
                        sharedWithDrivers: prev.totalRecorded
                      }));
                      
                      toast.success("Broadcast complete", {
                        description: "Nearby drivers have been notified"
                      });
                    }, 1500);
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span className="text-xs">Share with Drivers</span>
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Export/Import Options</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="text-xs">Export Data</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    toast.info("Import data", {
                      description: "Select a file to import pothole data"
                    });
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="text-xs">Import Data</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Integrations</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    toast.info("Connecting to Map Services", {
                      description: "Integrating with external mapping providers"
                    });
                  }}
                >
                  <Map className="h-4 w-4 mr-2" />
                  <span className="text-xs">Map Services</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    toast.info("Connecting to Analytics", {
                      description: "Setting up data analytics pipeline"
                    });
                  }}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  <span className="text-xs">Analytics Tools</span>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <h4 className="text-sm font-medium">Cloud Storage</h4>
                <span className="text-xs text-muted-foreground">
                  {dataSummary.storageUsed} MB / 500 MB
                </span>
              </div>
              <Progress value={(dataSummary.storageUsed / 500) * 100} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/20 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Database Size</div>
                <div className="text-xl font-bold">{Math.round(dataSummary.storageUsed * 0.8)} MB</div>
              </div>
              <div className="bg-muted/20 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Media Size</div>
                <div className="text-xl font-bold">{Math.round(dataSummary.storageUsed * 0.2)} MB</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Storage Options</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    toast.info("Optimizing storage", {
                      description: "Compressing and optimizing stored data"
                    });
                    
                    setTimeout(() => {
                      setDataSummary(prev => ({
                        ...prev,
                        storageUsed: Math.max(0, prev.storageUsed - 20)
                      }));
                      
                      toast.success("Storage optimized", {
                        description: "Saved approximately 20 MB of storage"
                      });
                    }, 2000);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="text-xs">Optimize Storage</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    toast.info("Cloud backup", {
                      description: "Creating backup of all pothole data"
                    });
                    
                    setTimeout(() => {
                      toast.success("Backup complete", {
                        description: "All data safely backed up to cloud storage"
                      });
                    }, 2500);
                  }}
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  <span className="text-xs">Create Backup</span>
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Data Retention</h4>
              <div className="text-xs text-muted-foreground">
                <p>Current policy: Store data for 90 days</p>
                <p>Oldest record: {dataSummary.lastSync 
                  ? new Date(dataSummary.lastSync.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString() 
                  : 'None'}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {!simulationActive && (
          <div className="text-center py-4">
            <div className="text-xs text-muted-foreground">
              Start simulation to collect and manage pothole data
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataManagement;
