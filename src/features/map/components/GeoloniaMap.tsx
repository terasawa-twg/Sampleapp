// src\features\map\components\GeoloniaMap.tsx

'use client';

import { useRef, useEffect, useState } from 'react';
import type { GeoloniaMapProps } from '../types';

// GeoloniaMapコンポーネント（マップ機能専用）
export default function GeoloniaMap({ 
  locations, 
  isLoading = false, 
  error = null,
  onLocationClick,
  onMapError,
  disableNewMarker = false // 新規マーカー作成を無効化するオプション
}: GeoloniaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<GeoloniaMarker | null>(null);
  const locationMarkersRef = useRef<GeoloniaMarker[]>([]);
  const mapRef = useRef<GeoloniaMap | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDomReady, setIsDomReady] = useState(false);

  // DOM要素の準備を待つ
  useEffect(() => {
    console.log('DOM準備チェック開始');
    const checkDomReady = () => {
      if (mapContainerRef.current) {
        console.log('DOM要素が準備できました');
        setIsDomReady(true);
      } else {
        console.log('DOM要素未準備、再チェック中...');
        setTimeout(checkDomReady, 50);
      }
    };
    
    // 初回チェック
    checkDomReady();
  }, []);

  // 地図初期化（DOM準備完了後）
  useEffect(() => {
    if (!isDomReady) {
      console.log('DOM未準備のため地図初期化をスキップ');
      return;
    }
    
    console.log('GeoloniaMap: 地図初期化開始', {
      mapContainer: !!mapContainerRef.current,
      disableNewMarker,
      locations: locations.length,
      isDomReady
    });

    if (!mapContainerRef.current) {
      console.error('DOM準備完了後もmapContainerRef.currentが存在しません');
      return;
    }

    let retryCount = 0;
    const maxRetries = 20;

    const initializeMap = () => {
      console.log('地図初期化試行:', retryCount + 1, 'window.geolonia:', !!window.geolonia);
      try {
        if (!window.geolonia) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log('Geolonia API未読み込み。再試行中...', retryCount);
            setTimeout(initializeMap, 200);
            return;
          }
          throw new Error('Geolonia Maps APIの読み込みに失敗しました');
        }

        console.log('Geolonia API読み込み完了。地図を作成中...');

        if (mapRef.current) {
          console.log('既存の地図を削除中...');
          mapRef.current.remove();
        }

        console.log('新しい地図を作成中...', {
          center: [139.6917, 35.6895],
          zoom: 12,
          disableNewMarker,
          apiKey: !!process.env.NEXT_PUBLIC_GEOLONIA_API_KEY
        });

        mapRef.current = new window.geolonia.Map({
          container: mapContainerRef.current!,
          center: [139.6917, 35.6895], // 東京エリア
          zoom: 12,
          marker: false,
          apiKey: process.env.NEXT_PUBLIC_GEOLONIA_API_KEY,
        });

        console.log('地図作成完了:', mapRef.current);

        // 地図の読み込み完了を待つ
        (mapRef.current as any).on('load', () => {
          console.log('地図の読み込みが完了しました');
          
          // 地図クリックイベント（disableNewMarkerがfalseの場合のみ登録）
          if (!disableNewMarker) {
            console.log('地図クリックイベントを登録（新規マーカー作成有効）');
            if (mapRef.current) {
              mapRef.current.on('click', handleMapClick);
            }
          } else {
            console.log('地図クリックイベントをスキップ（新規マーカー作成無効）');
          }

          // 少し遅延してから初期化完了とする（地図の描画を待つ）
          setTimeout(() => {
            setMapInitialized(true);
            setMapError(null);
            console.log('地図初期化完了');
          }, 1000);
        }); // ← ここでon('load', ...)のコールバックと呼び出しを閉じる

      } catch (err) {
        console.error('地図初期化エラー:', err);
        const errorMessage = err instanceof Error ? err.message : '地図の初期化に失敗しました';
        setMapError(errorMessage);
        onMapError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    initializeMap();

    return () => {
      console.log('GeoloniaMap: クリーンアップ開始');
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapInitialized(false);
      console.log('GeoloniaMap: クリーンアップ完了');
    };
  }, [isDomReady, onMapError, disableNewMarker]);

  // 地図クリックハンドラー（既存機能を維持）
  const handleMapClick = async (e: GeoloniaMapEvent) => {
    console.log('地図がクリックされました:', e.lngLat);
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

      console.log('新規マーカーを作成しました:', { lng, lat });

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
        console.log(`住所: ${loc.prefecture}${loc.city}${loc.town} (${loc.postal})`);
      } else {
        console.log('該当住所が見つかりませんでした');
      }
    } catch (error) {
      console.warn('逆ジオコーディング処理でエラーが発生しました:', error);
    }
  };

  // 訪問先マーカーの管理
  useEffect(() => {
    console.log('訪問先マーカー管理:', {
      mapInitialized,
      locationsCount: locations.length,
      hasMap: !!mapRef.current
    });

    if (!mapInitialized || !mapRef.current) {
      console.log('地図未初期化またはmapRef未設定のため、マーカー処理をスキップ');
      return;
    }

    // 既存のマーカーをクリーンアップ
    console.log('既存マーカーをクリーンアップ中...', locationMarkersRef.current.length, '個');
    locationMarkersRef.current.forEach((marker, index) => {
      try {
        marker.remove();
        console.log(`マーカー${index + 1}を削除しました`);
      } catch (err) {
        console.warn('マーカーの削除でエラーが発生しました:', err);
      }
    });
    locationMarkersRef.current = [];

    // 新しいマーカーを追加（地図が初期化されているので即座に追加）
    console.log('新しいマーカーを追加中...', locations.length, '個');
    locations.forEach((location, index) => {
      try {
        console.log(`マーカー${index + 1}を作成中:`, location.name, `(${location.lat}, ${location.lng})`);
        const marker = new window.geolonia.Marker()
          .setLngLat([location.lng, location.lat])
          .addTo(mapRef.current!);

        // マーカーの見た目とイベントを設定
        setTimeout(() => {
          setupMarker(marker, location);
        }, 100);
        
        locationMarkersRef.current.push(marker);
        console.log(`マーカー${index + 1}を作成完了`);
      } catch (err) {
        console.warn(`マーカーの作成でエラーが発生しました (${location.name}):`, err);
      }
    });

    return () => {
      console.log('マーカークリーンアップ開始...');
      locationMarkersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (err) {
          console.warn('マーカーのクリーンアップでエラーが発生しました:', err);
        }
      });
      locationMarkersRef.current = [];
      console.log('マーカークリーンアップ完了');
    };
  }, [mapInitialized, locations, onLocationClick]);

  // マーカーのセットアップ
  const setupMarker = (marker: GeoloniaMarker, location: any) => {
    console.log('マーカーセットアップ開始:', location.name);
    try {
      let markerElement: HTMLElement | null = null;
      
      // 複数の方法でマーカー要素を取得を試行
      if (typeof marker.getElement === 'function') {
        markerElement = marker.getElement();
        console.log('getElement()でマーカー要素を取得');
      } else if ((marker as any)._element) {
        markerElement = (marker as any)._element;
        console.log('_elementでマーカー要素を取得');
      } else {
        // DOM要素を直接検索する最後の手段
        const markerElements = mapContainerRef.current?.querySelectorAll('.geolonia-marker');
        if (markerElements && markerElements.length > 0) {
          markerElement = markerElements[markerElements.length - 1] as HTMLElement;
          console.log('DOM検索でマーカー要素を取得');
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
        console.log(`SVGの色を設定: ${location.isActive ? '赤' : '青'}`);
      } else {
        // SVGが見つからない場合は、マーカー全体の背景色を変更
        markerElement.style.color = location.isActive ? '#ef4444' : '#3b82f6';
        console.log(`マーカー全体の色を設定: ${location.isActive ? '赤' : '青'}`);
      }
      
      // クリックイベントを設定
      if (onLocationClick) {
        markerElement.addEventListener('click', (e: Event) => {
          console.log('マーカーがクリックされました:', location.name);
          e.stopPropagation();
          onLocationClick(location.id);
        });
        markerElement.style.cursor = 'pointer';
        markerElement.setAttribute('title', location.name);
        console.log('マーカーにクリックイベントを設定');
      }
      
      console.log('マーカーセットアップ完了:', location.name);
    } catch (err) {
      console.warn(`マーカーのセットアップでエラーが発生しました (${location.name}):`, err);
    }
  };

  // エラー表示
  if (error || mapError) {
    console.log('エラー表示:', { error, mapError });
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
    console.log('ローディング表示中（データ読み込み中）');
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">地図を読み込んでいます...</div>
        </div>
      </div>
    );
  }

  console.log('地図コンポーネントレンダリング:', { mapInitialized, isDomReady });

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