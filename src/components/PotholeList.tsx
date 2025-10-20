
import React from 'react';
import { Pothole } from '@/types';
import PotholeCard from './PotholeCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { potholes } from '@/data/potholes';

const PotholeList: React.FC = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-medium mb-4">Recently Detected Potholes</h3>
      {potholes.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No potholes detected yet. Use Video Analysis or Real-time Detection to find potholes.</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="grid gap-4">
            {potholes.map((pothole) => (
              <PotholeCard key={pothole.id} pothole={pothole} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default PotholeList;
