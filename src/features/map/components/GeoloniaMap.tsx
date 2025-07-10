// src/features/map/components/GeoloniaMap.tsx

'use client';

import { useRef, useEffect, useMemo } from 'react';
import type { GeoloniaMapProps } from '../types';
import type { GeoloniaMarker } from '../types/geolonia.types';
import { useMapInitialization } from '../hooks/useMapInitialization';
import { updateMarkerAppearance, setupMarker, cleanupMarkers } from '../utils/markerUtils';

// GeoloniaMapコンポーネント（マップ機能専用）
export default function GeoloniaMap({ 
  locations, 
  selectedLocationId,
  isLoading = false, 
  error = null,
  onLocationClick,
  onMapError,
  disableNewMarker = false
}: GeoloniaMapProps) {
  const locationMarkersRef = useRef<GeoloniaMarker[]>([]);
  
  // 地図初期化のカスタムフック
  const {
    mapContainerRef,
    mapRef,
    mapInitialized,
    mapError,
    isDomReady
  } = useMapInitialization({
    disableNewMarker,
    onMapError
  });

  // locationsをメモ化して、無駄な再作成を防ぐ
  const memoizedLocations = useMemo(() => {
    console.log('locations メモ化実行:', locations.length);
    return locations;
  }, [locations]);

  // locationsのIDリストをメモ化して、実際の変更のみを検出
  const locationIds = useMemo(() => {
    return memoizedLocations.map(loc => loc.id).sort().join(',');
  }, [memoizedLocations]);

  // 訪問先マーカーの作成（locationsのIDが変更された時のみ）
  useEffect(() => {
    console.log('訪問先マーカー作成/更新:', {
      mapInitialized,
      locationsCount: memoizedLocations.length,
      hasMap: !!mapRef.current,
      existingMarkers: locationMarkersRef.current.length,
      locationIds
    });

    if (!mapInitialized || !mapRef.current) {
      console.log('地図未初期化またはmapRef未設定のため、マーカー処理をスキップ');
      return;
    }

    // locationsが空の場合は既存マーカーをクリーンアップ
    if (memoizedLocations.length === 0) {
      console.log('locationsが空のため、既存マーカーをクリーンアップ');
      cleanupMarkers(locationMarkersRef.current, mapContainerRef);
      locationMarkersRef.current = [];
      return;
    }

    // 既存マーカーのクリーンアップ
    cleanupMarkers(locationMarkersRef.current, mapContainerRef);
    locationMarkersRef.current = [];
    
    // 新しいマーカーを追加
    console.log('新しいマーカーを追加中...', memoizedLocations.length, '個');
    memoizedLocations.forEach((location, index) => {
      try {
        console.log(`マーカー${index + 1}を作成中:`, location.name, `(${location.lat}, ${location.lng})`);
        // window.geolonia の存在を確認
        if (!window.geolonia || !window.geolonia.Marker) {
          console.error('window.geolonia.Marker が利用できません');
          return;
        }
        
        const marker = new window.geolonia.Marker()
          .setLngLat([location.lng, location.lat])
          .addTo(mapRef.current!);

        // マーカーにlocation情報を紐付け
        marker._locationData = {
          id: location.id,
          name: location.name,
          lat: location.lat,
          lng: location.lng
        };
        console.log(`マーカー${index + 1}にlocationDataを設定:`, location.name, location.id);

        // マーカーの初期設定
        setTimeout(() => {
          setupMarker(marker, location, onLocationClick);
          // 初期状態で選択状態を反映
          updateMarkerAppearance(marker, location, selectedLocationId);
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
  }, [mapInitialized, locationIds, onLocationClick, mapRef, mapContainerRef]);
  
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
      const location = marker._locationData;
      if (location) {
        console.log(`マーカー${index + 1}の表示更新:`, location.name);
        updateMarkerAppearance(marker, location, selectedLocationId);
      }
    });
  }, [selectedLocationId, mapInitialized]);

  // エラー表示
  if (error ?? mapError) {
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