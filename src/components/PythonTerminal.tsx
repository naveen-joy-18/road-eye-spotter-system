
import React, { useState, useEffect, useRef } from 'react';
import { executePythonCommand } from '@/services/cerebrasAI';

interface PythonTerminalProps {
  active: boolean;
  frameCount: number;
  className?: string;
}

const PythonTerminal: React.FC<PythonTerminalProps> = ({ active, frameCount, className }) => {
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "[INFO] Initializing environment for pothole detection",
    "[INFO] Loading YOLOv5 model weights from ./models/pothole_detection_v3.pt",
    "[INFO] GPU acceleration enabled: CUDA 11.7 detected"
  ]);
  const [command, setCommand] = useState<string>("python3 pothole_detection.py --video input.mp4 --model yolov5");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Add new logs periodically when active
  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(async () => {
      setIsProcessing(true);
      try {
        // Generate output using Cerebras AI for current frame
        const pythonCommand = `print_detection_status(${frameCount})`;
        const newLines = await executePythonCommand(pythonCommand);
        
        setTerminalLines(prev => {
          const updatedLines = [...prev, ...newLines];
          // Keep the terminal at a reasonable size
          return updatedLines.slice(Math.max(0, updatedLines.length - 50));
        });
      } catch (error) {
        console.error("Error getting Python output:", error);
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [active, frameCount]);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessing) return;
    
    // Add user command to terminal
    setTerminalLines(prev => [...prev, `$ ${command}`]);
    setIsProcessing(true);
    
    try {
      // Execute command using Cerebras AI
      const output = await executePythonCommand(command);
      
      setTerminalLines(prev => [...prev, ...output]);
      setCommand("");
    } catch (error) {
      setTerminalLines(prev => [...prev, "Error: Failed to execute command"]);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className={`bg-[#131620] text-emerald-400 font-mono text-xs p-3 rounded-md border border-emerald-900/30 shadow-lg ${className || ''}`}>
      <div className="flex justify-between items-center mb-2 border-b border-emerald-900/50 pb-1">
        <div className="opacity-80">{command}</div>
        <div className="flex gap-2">
          <div className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <div className="text-xs text-emerald-700">{active ? 'RUNNING' : 'STOPPED'}</div>
        </div>
      </div>
      <div 
        ref={terminalRef}
        className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900/50 scrollbar-track-[#0d1117] pb-1"
      >
        {terminalLines.map((line, i) => (
          <div key={i} className="leading-5 break-all">
            {line}
          </div>
        ))}
        {isProcessing && <div className="inline-block h-4 w-2 bg-emerald-500 animate-pulse ml-1"></div>}
      </div>
      
      <form onSubmit={handleCommandSubmit} className="mt-2 flex border-t border-emerald-900/50 pt-2">
        <span className="text-emerald-700 mr-1">$</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-emerald-400"
          placeholder="Enter Python command..."
          disabled={isProcessing}
        />
      </form>
    </div>
  );
};

export default PythonTerminal;
