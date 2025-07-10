// src/features/map/hooks/useMapState.ts

import { useState, useCallback } from 'react';
import type { MapState, VisitLocation } from '../types';

// 地図の状態管理フック
export function useMapState(locations: VisitLocation[]) {
  const [mapState, setMapState] = useState<MapState>({
    selectedLocationId: null,
    isMapInitialized: false,
    mapError: null,
  });

  // 選択中の訪問先を設定
  const selectLocation = useCallback((locationId: string) => {
    console.log('selectLocation実行:', locationId);

    setMapState(prev => ({
      ...prev,
      selectedLocationId: locationId,
    }));
   }, []); // 依存配列は空のまま、存在チェックは削除

  // 選択中の訪問先を解除
  const deselectLocation = useCallback(() => {
    console.log('deselectLocation実行');
    setMapState(prev => ({
      ...prev,
      selectedLocationId: null,
    }));
  }, []);

  // 地図の初期化状態を設定
  const setMapInitialized = useCallback((initialized: boolean) => {
    setMapState(prev => ({
      ...prev,
      isMapInitialized: initialized,
    }));
  }, []);

  // 地図のエラー状態を設定
  const setMapError = useCallback((error: string | null) => {
    setMapState(prev => ({
      ...prev,
      mapError: error,
    }));
  }, []);

  // 地図のエラー状態をクリア（依存配列を空にして安定化）
  const clearMapError = useCallback(() => {
    setMapState(prev => ({
      ...prev,
      mapError: null,
    }));
  }, []); // setMapErrorへの依存を削除し、直接setMapStateを使用

  // 現在選択中のlocationを実際に取得（リアルタイム）
  const currentSelectedLocation = locations.find(loc => loc.id === mapState.selectedLocationId) ?? null;

  // デバッグ用ログ
  console.log('useMapState状況:', {
    selectedLocationId: mapState.selectedLocationId,
    selectedLocationExists: !!currentSelectedLocation,
    locationsCount: locations.length,
    selectedLocationName: currentSelectedLocation?.name ?? 'なし'
  });

  return {
    ...mapState,
    selectedLocation: currentSelectedLocation, // リアルタイムで取得
    selectLocation,
    deselectLocation,
    setMapInitialized,
    setMapError,
    clearMapError,
  };
}