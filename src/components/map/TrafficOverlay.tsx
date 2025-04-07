
import React from 'react';

interface TrafficOverlayProps {
  density: number;
}

export const TrafficOverlay: React.FC<TrafficOverlayProps> = ({ density }) => {
  // Calculate color intensity based on traffic density
  const getColor = () => {
    if (density > 75) return 'from-red-500/0 to-red-500/40';
    if (density > 50) return 'from-orange-500/0 to-orange-500/30';
    if (density > 25) return 'from-yellow-500/0 to-yellow-500/20';
    return 'from-green-500/0 to-green-500/10';
  };

  return (
    <div 
      className={`absolute inset-0 bg-gradient-to-b ${getColor()} pointer-events-none transition-opacity duration-500`}
      style={{ opacity: density / 100 }}
    >
      {/* Traffic flow lines */}
      {density > 30 && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-[200%] top-0 left-0 animate-[flow_10s_linear_infinite]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white/10 h-px w-[40%] blur-[1px]"
                style={{ 
                  top: `${5 + (i * 5)}%`, 
                  left: `${Math.random() * 60}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
