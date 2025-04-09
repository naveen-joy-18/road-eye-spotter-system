
import { useState, useEffect, useRef } from 'react';

// Define interface for the hook return value
interface UseMapReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

/**
 * Hook to manage map loading state
 */
export function useGoogleMaps(apiKey: string): UseMapReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error("Map API key is missing"));
      return;
    }
    
    // Simulate successful loading after a short delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [apiKey]);

  return { isLoaded, loadError };
}

export function isGoogleMapsLoaded(): boolean {
  return true; // Always return true as we're not using Google Maps anymore
}
