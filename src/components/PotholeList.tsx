
import React from 'react';
import { Pothole } from '@/types';
import PotholeCard from './PotholeCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { potholes } from '@/data/potholes';

const PotholeList: React.FC = () => {
  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <h3 className="font-medium mb-4">Recently Reported Potholes</h3>
      {potholes.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500">No potholes reported yet</p>
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
