
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Menu, Bell, User, MapPin, BarChart4, ChevronDown, Settings } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [notificationCount, setNotificationCount] = useState(3);
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");
  
  const indianCities = [
    "Delhi NCR",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow"
  ];

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              <span>Road Eye</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-normal">
                India
              </span>
            </h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r border-border">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold mt-6 mb-6 text-primary flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-secondary" />
                  <span>Road Eye</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-normal">
                    India
                  </span>
                </h2>
                
                <div className="border border-border rounded-md p-3 mb-6">
                  <div className="text-sm font-medium mb-1">Selected Region</div>
                  <select 
                    className="w-full text-sm p-2 border rounded"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {indianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <Button
                    variant={activeTab === 'map' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onTabChange('map')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Road Map
                  </Button>
                  <Button
                    variant={activeTab === 'report' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onTabChange('report')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Pothole
                  </Button>
                  <Button
                    variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onTabChange('dashboard')}
                  >
                    <BarChart4 className="h-4 w-4 mr-2" />
                    Analytics Dashboard
                  </Button>
                  <Button
                    variant={activeTab === 'video' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onTabChange('video')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Video Analysis
                  </Button>
                </div>
                
                <div className="mt-auto border-t border-border pt-4">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
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
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="map" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <MapPin className="h-4 w-4 mr-2" />
                Road Map
              </TabsTrigger>
              <TabsTrigger value="report" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Pothole
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart4 className="h-4 w-4 mr-2" /> 
                Analytics
              </TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Video Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          {/* City selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="outline" size="sm" className="gap-1">
                <MapPin className="h-4 w-4 text-primary" />
                {selectedCity}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {indianCities.map(city => (
                <DropdownMenuItem 
                  key={city} 
                  onClick={() => setSelectedCity(city)}
                  className={city === selectedCity ? "bg-muted" : ""}
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                {notificationCount}
              </Badge>
            )}
          </Button>
          
          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>My Reports</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Sub-header with India-specific information */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 py-1 px-4 text-xs border-t border-border hidden md:block">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="font-medium mr-1">Active Regions:</span>
              <span>28 States & 8 UTs</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1">Road Network:</span>
              <span>6.2 Million km</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Current Focus:</span>
            <span className="text-primary">{selectedCity}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
