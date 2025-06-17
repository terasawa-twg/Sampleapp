'use client';

import { useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useVisitLocations } from '@/features/map/hooks/useVisitLocations';
import { useMapState } from '@/features/map/hooks/useMapState';
import { useVisitHistory } from '@/features/map/hooks/useVisitHistory';
import GeoloniaMap from '@/app/_components/GeoloniaMap';import VisitHistoryPanel from './VisitHistoryPanel';
import MapControls from './MapControls';

// マップ機能のメインコンテナコンポーネント
export default function MapContainer() {
  // データ管理
  const { locations, isLoading: locationsLoading, error: locationsError, refetch } = useVisitLocations();
  
  // 地図状態管理
  const {
    selectedLocation,
    mapError,
    selectLocation,
    deselectLocation,
    setMapError,
    clearMapError,
  } = useMapState(locations);
  
  // 訪問履歴データ管理
  const { history, isLoading: historyLoading, error: historyError } = useVisitHistory(selectedLocation?.name);

  // イベントハンドラー
  const handleLocationClick = useCallback((locationId: string) => {
    selectLocation(locationId);
  }, [selectLocation]);

  const handleAddLocation = useCallback(() => {
    // TODO: 訪問先追加モーダルを開く
    console.log('訪問先を追加');
  }, []);

  const handleMapError = useCallback((error: Error) => {
    setMapError(error.message);
    console.error('地図エラー:', error);
  }, [setMapError]);

  const handleRetry = useCallback(() => {
    clearMapError();
    refetch();
  }, [clearMapError, refetch]);

  // 状態の計算
  const hasError = locationsError || mapError;
  const isLoading = locationsLoading;

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* エラー表示 */}
      {hasError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 max-w-md w-full mx-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">エラーが発生しました</p>
                  <p className="text-sm text-red-600 mt-1">{locationsError || mapError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 地図エリア */}
      <div className="absolute inset-0">
        <GeoloniaMap />
      </div>

      {/* 地図コントロール */}
      <div className="absolute top-4 right-4 z-10">
        <MapControls
          onAddLocation={handleAddLocation}
          onRefresh={handleRetry}
          isLoading={isLoading}
          hasError={!!hasError}
        />
      </div>

      {/* 訪問履歴パネル */}
      {selectedLocation && (
        <VisitHistoryPanel
          selectedLocation={selectedLocation}
          history={history}
          isLoading={historyLoading}
          error={historyError}
          onClose={deselectLocation}
        />
      )}
    </div>
  );
}