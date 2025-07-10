// src/features/map/types/geolonia.types.ts

// 既存の型定義をインポート（既存のgeolonia.d.tsから）
// 既存の型定義と競合を避けるため、新しい名前で定義
export interface GeoloniaMarker {
  setLngLat: (lngLat: [number, number]) => GeoloniaMarker;
  addTo: (map: GeoloniaMap) => GeoloniaMarker;
  remove: () => void;
  getElement?: () => HTMLElement | null;
  _element?: HTMLElement;
  _locationData?: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
  _clickHandler?: (e: Event) => void;
  _clickHandlerSet?: boolean;
}

export interface GeoloniaMap {
  remove: () => void;
  on: (event: string, handler: (e: GeoloniaMapEvent) => void) => void;
}

export interface GeoloniaMapEvent {
  lngLat: { lng: number; lat: number };
}

export interface HeartRailsGeoAPIResponse {
  response: {
    location: Array<{
      prefecture: string;
      city: string;
      town: string;
      postal: string;
    }>;
  };
}

declare global {
  interface Window {
    geolonia: {
      Map: new (options: {
        container: HTMLElement;
        center: [number, number];
        zoom: number;
        marker: boolean;
        apiKey?: string;
      }) => GeoloniaMap;
      Marker: new () => GeoloniaMarker;
    };
  }
}
