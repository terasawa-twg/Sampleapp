import { useState, useCallback } from 'react';
import type { MapState, VisitLocation } from '../types';

// 地図の状態管理フック
export function useMapState(locations: VisitLocation[]) {
  const [mapState, setMapState] = useState<MapState>({
    selectedLocationId: null,
    isMapInitialized: false,
    mapError: null,
  });

  // 選択中の訪問先を取得
  const selectedLocation = locations.find(loc => loc.id === mapState.selectedLocationId) || null;

  // 選択中の訪問先を設定
  const selectLocation = useCallback((locationId: string) => {
    setMapState(prev => ({
      ...prev,
      selectedLocationId: locationId,
    }));
  }, []);

  // 選択中の訪問先を解除
  const deselectLocation = useCallback(() => {
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

  // 地図のエラー状態をクリア
  const clearMapError = useCallback(() => {
    setMapError(null);
  }, [setMapError]);

  // 初期化時に地図の状態を設定
  return {
    ...mapState,
    selectedLocation,
    selectLocation,
    deselectLocation,
    setMapInitialized,
    setMapError,
    clearMapError,
  };
}