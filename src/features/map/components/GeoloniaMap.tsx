// src\features\map\components\GeoloniaMap.tsx

'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { GeoloniaMapProps } from '../types';

// GeoloniaMapコンポーネント（マップ機能専用）
export default function GeoloniaMap({ 
  locations, 
  selectedLocationId, // 選択中の訪問先IDを受け取る
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

  // locationsをメモ化して、無駄な再作成を防ぐ
  const memoizedLocations = useMemo(() => {
    console.log('locations メモ化実行:', locations.length);
    return locations;
  }, [
    locations.length, 
    locations.map(l => `${l.id}-${l.lat}-${l.lng}-${l.name}`).join(',')
  ]);

  // マーカーの見た目だけを更新する関数
  const updateMarkerAppearance = useCallback((marker: GeoloniaMarker, location: any, selectedLocationId?: string | null) => {
    try {
      let markerElement: HTMLElement | null = null;
      
      if (typeof marker.getElement === 'function') {
        markerElement = marker.getElement();
      } else if ((marker as any)._element) {
        markerElement = (marker as any)._element;
      }

      if (!markerElement) {
        console.warn(`マーカー要素が取得できません: ${location.name}`);
        return;
      }

      const isSelected = selectedLocationId === location.id;
      console.log(`マーカー表示更新: ${location.name} - ${isSelected ? '選択' : '非選択'}`);
      
      const svg = markerElement.querySelector('svg');
      if (svg) {
        const scale = isSelected ? 1.2 : 1;
        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = 'center bottom';
        
        const paths = svg.querySelectorAll('path');
        paths.forEach((path, index) => {
          if (isSelected) {
            const redColors = ['#ef4444', '#dc2626', '#b91c1c'];
            const color = redColors[index] || '#ef4444';
            path.style.setProperty('fill', color, 'important');
          } else {
            const blueColors = ['#3b82f6', '#2563eb', '#1d4ed8'];
            const color = blueColors[index] || '#3b82f6';
            path.style.setProperty('fill', color, 'important');
          }
        });
        
        svg.style.setProperty('fill', isSelected ? '#ef4444' : '#3b82f6', 'important');
      }
    } catch (err) {
      console.warn(`マーカー表示更新エラー (${location.name}):`, err);
    }
  }, []);

  // マーカーのセットアップ
  const setupMarker = useCallback((marker: GeoloniaMarker, location: any) => {
    console.log('マーカーセットアップ開始:', location.name);
    try {
      let markerElement: HTMLElement | null = null;
      
      // より確実な方法でマーカー要素を取得
      if (typeof marker.getElement === 'function') {
        markerElement = marker.getElement();
        console.log('getElement()でマーカー要素を取得');
      } else if ((marker as any)._element) {
        markerElement = (marker as any)._element;
        console.log('_elementでマーカー要素を取得');
      }

      // DOM要素が取得できない場合は再試行
      if (!markerElement) {
        console.warn(`マーカー要素を取得できませんでした。再試行します: ${location.name}`);
        setTimeout(() => setupMarker(marker, location), 100);
        return;
      }

      // 初期設定は常に非選択状態（青色、通常サイズ）
      console.log(`マーカー初期設定: ${location.name} - 非選択状態`);
      
      // マーカーの色とサイズを設定
      const svg = markerElement.querySelector('svg');
      if (svg) {
        svg.style.transform = 'scale(1)';
        svg.style.transformOrigin = 'center bottom';
        
        const paths = svg.querySelectorAll('path');
        paths.forEach((path, index) => {
          const blueColors = ['#3b82f6', '#2563eb', '#1d4ed8'];
          const color = blueColors[index] || '#3b82f6';
          path.style.setProperty('fill', color, 'important');
        });
        
        svg.style.setProperty('fill', '#3b82f6', 'important');
        console.log(`マーカー設定完了: ${location.name} - 色:青, サイズ:1倍`);
      } else {
        console.log(`SVGが見つかりません。マーカー全体を設定: ${location.name}`);
        
        markerElement.style.color = '#3b82f6';
        markerElement.style.setProperty('color', '#3b82f6', 'important');
        markerElement.style.transform = 'scale(1)';
        markerElement.style.transformOrigin = 'center bottom';

        // 子要素にも適用
        const childElements = markerElement.querySelectorAll('*');
        childElements.forEach(child => {
          if (child instanceof HTMLElement) {
            child.style.setProperty('fill', '#3b82f6', 'important');
            child.style.setProperty('color', '#3b82f6', 'important');
          }
        });

        console.log(`マーカー全体設定: ${location.name} - 色:青, サイズ:1倍`);
      }

      // クリックイベントを設定（初回のみ）
      if (onLocationClick && !(markerElement as any)._clickHandlerSet) {
        const clickHandler = (e: Event) => {
          console.log('マーカーがクリックされました:', location.name);
          e.stopPropagation();
          onLocationClick(location.id);
        };

        markerElement.addEventListener('click', clickHandler);
        (markerElement as any)._clickHandler = clickHandler;
        (markerElement as any)._clickHandlerSet = true;

        markerElement.style.cursor = 'pointer';
        markerElement.setAttribute('title', location.name);
        console.log('マーカーにクリックイベントを設定');
      }
      
      console.log('マーカーセットアップ完了:', location.name);
    } catch (err) {
      console.warn(`マーカーのセットアップでエラーが発生しました (${location.name}):`, err);
    }
  }, [onLocationClick]);

  // 地図クリックイベントハンドラー
  const handleMapClick = useCallback(async (e: GeoloniaMapEvent) => {
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
  }, []);

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
      locations: memoizedLocations.length,
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

        // 地図のスタイルを設定（必要に応じて）
        if (!disableNewMarker) {
          console.log('地図クリックイベントを登録（新規マーカー作成有効）');
          mapRef.current.on('click', handleMapClick);
        } else {
          console.log('地図クリックイベントをスキップ（新規マーカー作成無効）');
        }

        // 地図の初期化完了を通知
        setTimeout(() => {
          setMapInitialized(true);
          setMapError(null);
          console.log('地図初期化完了');
        }, 1000);

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
  }, [isDomReady, onMapError, disableNewMarker, handleMapClick]);

  // 訪問先マーカーの作成（メモ化されたlocationsを使用）
  useEffect(() => {
    console.log('訪問先マーカー作成:', {
      mapInitialized,
      locationsCount: memoizedLocations.length,
      hasMap: !!mapRef.current,
    });

    if (!mapInitialized || !mapRef.current || memoizedLocations.length === 0) {
      console.log('地図未初期化、mapRef未設定、またはlocationなしのため、マーカー処理をスキップ');
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

    // DOM上の残存マーカーも削除
    const existingMarkers = mapContainerRef.current?.querySelectorAll('.geolonia-marker');
    if (existingMarkers && existingMarkers.length > 0) {
      console.log('DOM上の残存マーカーを削除中...', existingMarkers.length, '個');
      existingMarkers.forEach((marker, index) => {
        try {
          marker.remove();
          console.log(`残存マーカー${index + 1}を削除しました`);
        } catch (err) {
          console.warn('残存マーカーの削除でエラーが発生しました:', err);
        }
      });
    }
    
    // 新しいマーカーを追加
    console.log('新しいマーカーを追加中...', memoizedLocations.length, '個');
    memoizedLocations.forEach((location, index) => {
      try {
        console.log(`マーカー${index + 1}を作成中:`, location.name, `(${location.lat}, ${location.lng})`);
        const marker = new window.geolonia.Marker()
          .setLngLat([location.lng, location.lat])
          .addTo(mapRef.current!);

        // マーカーにlocation情報を紐付け
        (marker as any)._locationData = location;
        console.log(`マーカー${index + 1}にlocationDataを設定:`, location.name, location.id);

        // マーカーの初期設定（初期状態は選択なし）
        setTimeout(() => {
          setupMarker(marker, location);
        }, 50);
        
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
  }, [mapInitialized, memoizedLocations, setupMarker]); // memoizedLocationsを使用
  
  // 選択状態が変更された時のマーカー表示更新（マーカー再作成は行わない）
  useEffect(() => {
    console.log('選択状態変更の表示更新:', {
      mapInitialized,
      markerCount: locationMarkersRef.current.length,
      selectedLocationId
    });

    // マーカーが作成されていない場合は何もしない
    if (!mapInitialized || locationMarkersRef.current.length === 0) {
      console.log('選択状態更新をスキップ: マーカー未作成');
      return;
    }

    console.log('選択状態のみ更新: マーカー表示を更新中...');

    // 全マーカーの表示を更新（再作成はしない）
    locationMarkersRef.current.forEach((marker, index) => {
      const location = (marker as any)._locationData;
      if (location) {
        console.log(`マーカー${index + 1}の表示更新:`, location.name);
        updateMarkerAppearance(marker, location, selectedLocationId);
      }
    });
  }, [selectedLocationId, mapInitialized, updateMarkerAppearance]); // currentSelectedLocationIdではなくpropsのselectedLocationIdを直接使用

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