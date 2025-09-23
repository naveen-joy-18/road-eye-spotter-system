// GPS and Location Service
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationData {
  coordinates: GPSCoordinates;
  address?: string;
  roadName?: string;
  city?: string;
  state?: string;
  country?: string;
}

class GPSService {
  private watchId: number | null = null;
  private lastKnownPosition: GPSCoordinates | null = null;

  /**
   * Get current GPS position
   */
  async getCurrentPosition(): Promise<GPSCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: GPSCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          
          this.lastKnownPosition = coordinates;
          console.log('[GPS] Current position:', coordinates);
          resolve(coordinates);
        },
        (error) => {
          console.error('[GPS] Error getting position:', error);
          reject(new Error(`GPS Error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  /**
   * Start watching GPS position for real-time tracking
   */
  startWatching(
    onPositionUpdate: (coordinates: GPSCoordinates) => void,
    onError?: (error: GeolocationPositionError) => void
  ): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    if (this.watchId !== null) {
      this.stopWatching();
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates: GPSCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        this.lastKnownPosition = coordinates;
        onPositionUpdate(coordinates);
      },
      (error) => {
        console.error('[GPS] Watch position error:', error);
        if (onError) onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
      }
    );

    console.log('[GPS] Started watching position');
  }

  /**
   * Stop watching GPS position
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('[GPS] Stopped watching position');
    }
  }

  /**
   * Get last known position
   */
  getLastKnownPosition(): GPSCoordinates | null {
    return this.lastKnownPosition;
  }

  /**
   * Reverse geocoding - convert coordinates to address
   */
  async reverseGeocode(coordinates: GPSCoordinates): Promise<LocationData> {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      const locationData: LocationData = {
        coordinates,
        address: data.display_name,
        roadName: data.address?.road || data.address?.highway,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country
      };
      
      console.log('[GPS] Reverse geocoded:', locationData);
      return locationData;
    } catch (error) {
      console.error('[GPS] Reverse geocoding error:', error);
      // Return basic location data even if geocoding fails
      return { coordinates };
    }
  }

  /**
   * Calculate distance between two GPS points (in meters)
   */
  calculateDistance(coord1: GPSCoordinates, coord2: GPSCoordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI/180;
    const φ2 = coord2.latitude * Math.PI/180;
    const Δφ = (coord2.latitude-coord1.latitude) * Math.PI/180;
    const Δλ = (coord2.longitude-coord1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Check if GPS is available
   */
  isGPSAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request GPS permissions
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isGPSAvailable()) {
      return false;
    }

    try {
      const result = await navigator.permissions.query({name: 'geolocation'});
      return result.state === 'granted' || result.state === 'prompt';
    } catch (error) {
      console.warn('[GPS] Permission check failed:', error);
      // Fallback: try to get position to test permission
      try {
        await this.getCurrentPosition();
        return true;
      } catch {
        return false;
      }
    }
  }
}

export const gpsService = new GPSService();