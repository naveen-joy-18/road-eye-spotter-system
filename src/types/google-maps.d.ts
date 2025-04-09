
// This file is kept for backward compatibility but is no longer used
// Since we've removed the Google Maps dependency

// Define empty types to prevent TypeScript errors
declare global {
  interface Window {
    initMap?: () => void;
  }
}

export {};
