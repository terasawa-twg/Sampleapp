// Geolonia型
interface GeoloniaMapOptions {
    container: HTMLElement;
    center: [number, number];
    zoom: number;
    marker: boolean;
    apiKey?: string;
}

interface GeoloniaMapEvent {
    lngLat: {
        lng: number;
        lat: number;
    };
}

interface GeoloniaMap {
    on: (event: 'click', handler: (e: GeoloniaMapEvent) => void) => void;
    remove: () => void;
}

interface GeoloniaMarker {
    setLngLat: (lngLat: [number, number]) => GeoloniaMarker;
    addTo: (map: GeoloniaMap) => GeoloniaMarker;
    remove: () => void;
}

// HeartRails Geo API型
interface HeartRailsLocation {
    prefecture: string;
    city: string;
    city_kana: string;
    town: string;
    town_kana: string;
    x: string;
    y: string;
    postal: string;
}

interface HeartRailsGeoAPIResponse {
    response: {
        location: HeartRailsLocation[];
    };
}

