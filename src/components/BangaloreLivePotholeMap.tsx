import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BangaloreLivePotholeMap: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Bangalore Live Pothole Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
            <iframe
              src="https://blr-potholes.pages.dev/"
              className="w-full h-full"
              title="Bangalore Live Pothole Map"
              allow="geolocation"
              style={{ border: 0 }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Real-time pothole data from Bangalore</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://blr-potholes.pages.dev/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BangaloreLivePotholeMap;
