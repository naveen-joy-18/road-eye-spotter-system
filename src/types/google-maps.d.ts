
// This declaration file makes the Google Maps API types available globally
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

// Main Google Maps namespace
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      setMapTypeId(mapTypeId: string): void;
      getMapTypeId(): string;
      data: {
        setStyle(style: (feature: any) => any): void;
        loadGeoJson(url: string): void;
        add(feature: any): void;
      };
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
      setTitle(title: string): void;
      setVisible(visible: boolean): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      setContent(content: string | Node): void;
      open(map: Map, anchor?: Marker): void;
      close(): void;
    }

    class TrafficLayer {
      constructor(opts?: TrafficLayerOptions);
      setMap(map: Map | null): void;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
    }

    interface MapsEventListener {
      remove(): void;
    }

    const event: {
      addListener(instance: any, eventName: string, handler: Function): MapsEventListener;
      removeListener(listener: MapsEventListener): void;
    };

    const SymbolPath: {
      CIRCLE: number;
      FORWARD_CLOSED_ARROW: number;
      FORWARD_OPEN_ARROW: number;
      BACKWARD_CLOSED_ARROW: number;
      BACKWARD_OPEN_ARROW: number;
    };

    const MapTypeId: {
      ROADMAP: string;
      SATELLITE: string;
      HYBRID: string;
      TERRAIN: string;
    };

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      fullscreenControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      [key: string]: any;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      label?: string | MarkerLabel;
      draggable?: boolean;
      visible?: boolean;
      [key: string]: any;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      disableAutoPan?: boolean;
      [key: string]: any;
    }

    interface TrafficLayerOptions {
      map?: Map;
      autoRefresh?: boolean;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
    }

    interface Icon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
    }

    interface Symbol {
      path: string | number;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      width: number;
      height: number;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }
  }
}

export {};
