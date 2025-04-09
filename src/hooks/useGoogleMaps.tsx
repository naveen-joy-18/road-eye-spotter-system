
import { useState, useEffect, useRef } from 'react';

// Define interface for the hook return value
interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

/**
 * Hook to load Google Maps API
 */
export function useGoogleMaps(apiKey: string): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error("Google Maps API key is missing"));
      return;
    }

    // Don't load if already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Define callback function that will be called once the API is loaded
    window.initMap = () => {
      setIsLoaded(true);
    };

    // Create script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      setLoadError(new Error(`Google Maps API failed to load: ${error}`));
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
      scriptRef.current = null;
    };

    // Add script to document
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Clean up script if component unmounts before loading completes
      window.initMap = undefined as any;
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
      scriptRef.current = null;
    };
  }, [apiKey]);

  return { isLoaded, loadError };
}

export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.google && window.google.maps);
}
