import React, { useState, useEffect, useRef } from 'react';
import { generatePythonTerminalOutput } from '@/utils/simulatedPythonBackend';

interface PythonTerminalProps {
  active: boolean;
  frameCount: number;
  className?: string;
}

const PythonTerminal: React.FC<PythonTerminalProps> = ({ active, frameCount, className }) => {
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "[INFO] Initializing TensorFlow environment",
    "[INFO] Loading YOLOv5 model weights from ./models/pothole_detection_v3.pt",
    "[INFO] GPU acceleration enabled: CUDA 11.7 detected"
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Add new logs periodically when active
  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      const newLines = generatePythonTerminalOutput(frameCount);
      setTerminalLines(prev => {
        const updatedLines = [...prev, ...newLines];
        // Keep the terminal at a reasonable size
        return updatedLines.slice(Math.max(0, updatedLines.length - 50));
      });
    }, 800);
    
    return () => clearInterval(interval);
  }, [active, frameCount]);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  return (
    <div className={`bg-black text-green-500 font-mono text-xs p-3 rounded-md ${className || ''}`}>
      <div className="flex justify-between items-center mb-2 border-b border-green-900 pb-1">
        <div>python3 pothole_detection.py --video input.mp4 --model yolov5</div>
        <div className="flex gap-2">
          <div className={`h-2 w-2 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <div className="text-xs text-green-700">{active ? 'RUNNING' : 'STOPPED'}</div>
        </div>
      </div>
      <div 
        ref={terminalRef}
        className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black pb-1"
      >
        {terminalLines.map((line, i) => (
          <div key={i} className="leading-5 break-all">
            {line}
          </div>
        ))}
        {active && <div className="inline-block h-4 w-2 bg-green-500 animate-pulse ml-1"></div>}
      </div>
    </div>
  );
};

export default PythonTerminal;
