'use client';

import { useRef, useEffect, useState } from 'react';
import type { GeoloniaMapProps } from '@/features/map/types/index';

// GeoloniaMapコンポーネント（マップ機能専用）
export default function GeoloniaMap({ 
  locations, 
  isLoading = false, 
  error = null,
  onLocationClick,
  onMapError 
}: GeoloniaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<GeoloniaMarker | null>(null);
  const locationMarkersRef = useRef<GeoloniaMarker[]>([]);
  const mapRef = useRef<GeoloniaMap | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // 地図初期化
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let retryCount = 0;
    const maxRetries = 10;

    const initializeMap = () => {
      try {
        if (!window.geolonia) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(initializeMap, 100);
            return;
          }
          throw new Error('Geolonia Maps APIの読み込みに失敗しました');
        }

        if (mapRef.current) {
          mapRef.current.remove();
        }

        mapRef.current = new window.geolonia.Map({
          container: mapContainerRef.current!,
          center: [140.88118916, 38.26062846],
          zoom: 16,
          marker: false,
          apiKey: process.env.NEXT_PUBLIC_GEOLONIA_API_KEY,
        });

        // 地図クリックイベント（既存機能を維持）
        mapRef.current.on('click', handleMapClick);
        
        setMapInitialized(true);
        setMapError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '地図の初期化に失敗しました';
        setMapError(errorMessage);
        onMapError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapInitialized(false);
    };
  }, [onMapError]);

  // 地図クリックハンドラー（既存機能を維持）
  const handleMapClick = async (e: GeoloniaMapEvent) => {
    try {
      const { lng, lat } = e.lngLat;
      
      // 既存のマーカーを削除
      if (markerRef.current) {
        markerRef.current.remove();
      }
      
      // 新しいマーカーを追加
      markerRef.current = new window.geolonia.Marker()
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      // 逆ジオコーディング（既存機能を維持）
      const res = await fetch(
        `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`
      );
      
      if (!res.ok) {
        throw new Error('逆ジオコーディングAPIのリクエストに失敗しました');
      }
      
      const data = (await res.json()) as HeartRailsGeoAPIResponse;
      const loc = data.response.location[0];
      
      if (loc) {
        console.log(`${loc.prefecture}${loc.city}${loc.town} (${loc.postal})`);
      } else {
        console.log('該当住所が見つかりませんでした');
      }
    } catch (error) {
      console.warn('逆ジオコーディング処理でエラーが発生しました:', error);
    }
  };

  // 訪問先マーカーの管理
  useEffect(() => {
    if (!mapInitialized || !mapRef.current) return;

    // 既存のマーカーをクリーンアップ
    locationMarkersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (err) {
        console.warn('マーカーの削除でエラーが発生しました:', err);
      }
    });
    locationMarkersRef.current = [];

    // 新しいマーカーを追加
    locations.forEach((location) => {
      try {
        const marker = new window.geolonia.Marker()
          .setLngLat([location.lng, location.lat])
          .addTo(mapRef.current!);

        // マーカーの見た目とイベントを設定（少し遅延させる）
        setTimeout(() => {
          setupMarker(marker, location);
        }, 100);
        
        locationMarkersRef.current.push(marker);
      } catch (err) {
        console.warn(`マーカーの作成でエラーが発生しました (${location.name}):`, err);
      }
    });

    return () => {
      locationMarkersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (err) {
          console.warn('マーカーのクリーンアップでエラーが発生しました:', err);
        }
      });
      locationMarkersRef.current = [];
    };
  }, [mapInitialized, locations, onLocationClick]);

  // マーカーのセットアップ
  const setupMarker = (marker: GeoloniaMarker, location: any) => {
    try {
      let markerElement: HTMLElement | null = null;
      
      // 複数の方法でマーカー要素を取得を試行
      if (typeof marker.getElement === 'function') {
        markerElement = marker.getElement();
      } else if ((marker as any)._element) {
        markerElement = (marker as any)._element;
      } else {
        // DOM要素を直接検索する最後の手段
        const markerElements = mapContainerRef.current?.querySelectorAll('.geolonia-marker');
        if (markerElements && markerElements.length > 0) {
          markerElement = markerElements[markerElements.length - 1] as HTMLElement;
        }
      }

      if (!markerElement) {
        console.warn(`マーカー要素を取得できませんでした: ${location.name}`);
        return;
      }

      // マーカーの色を設定
      const svg = markerElement.querySelector('svg');
      if (svg) {
        svg.style.fill = location.isActive ? '#ef4444' : '#3b82f6';
      } else {
        // SVGが見つからない場合は、マーカー全体の背景色を変更
        markerElement.style.color = location.isActive ? '#ef4444' : '#3b82f6';
      }
      
      // クリックイベントを設定
      if (onLocationClick) {
        markerElement.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          onLocationClick(location.id);
        });
        markerElement.style.cursor = 'pointer';
        markerElement.setAttribute('title', location.name);
      }
    } catch (err) {
      console.warn(`マーカーのセットアップでエラーが発生しました (${location.name}):`, err);
    }
  };

  // エラー表示
  if (error || mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-6">
          <div className="text-red-500 text-lg font-medium mb-2">
            地図の読み込みに失敗しました
          </div>
          <div className="text-gray-600 text-sm">
            {error || mapError}
          </div>
        </div>
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">地図を読み込んでいます...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* 地図が初期化されていない場合の表示 */}
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">地図を初期化しています...</div>
          </div>
        </div>
      )}
    </div>
  );
}