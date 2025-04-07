
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              Road Eye
            </h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold mt-6 mb-10 text-primary flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-secondary" />
                  Road Eye
                </h2>
                
                <div className="space-y-4">
                  <Button
                    variant={activeTab === 'map' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onTabChange('map')}
                  >
                    Map View
                  </Button>
                  <Button
                    variant={activeTab === 'report' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onTabChange('report')}
                  >
                    Report Pothole
                  </Button>
                  <Button
                    variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onTabChange('dashboard')}
                  >
                    Dashboard
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden md:block">
          <Tabs 
            value={activeTab} 
            onValueChange={onTabChange}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="report">Report Pothole</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div>
          {/* Placeholder for future user profile/settings */}
          <div className="w-8 h-8"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
