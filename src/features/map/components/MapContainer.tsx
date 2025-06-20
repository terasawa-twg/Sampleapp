'use client';

import { useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useVisitLocations } from '../hooks/useVisitLocations';
import { useMapState } from '../hooks/useMapState';
import { useVisitHistory } from '../hooks/useVisitHistory';
import GeoloniaMap from './GeoloniaMap';
import VisitHistoryPanel from './VisitHistoryPanel';
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

  // デバッグ用：データの状況をコンソールに出力
  console.log('MapContainer状況:', {
    locationsCount: locations.length,
    isLoading,
    hasError,
    locations: locations, // 全データを表示
    locationNames: locations.map(loc => loc.name) // 名前のみ表示
  });

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
        <GeoloniaMap 
          locations={locations}
          isLoading={isLoading}
          error={hasError ? (locationsError || mapError) : null}
          onLocationClick={handleLocationClick}
          onMapError={handleMapError}
          disableNewMarker={true}
        />
      </div>

      {/* 地図コントロール */}
      <div className="absolute top-4 right-4 z-10">
        <MapControls
          onAddLocation={handleAddLocation}
          onRefresh={handleRetry}
          isLoading={isLoading}
          hasError={!!hasError}
        />

        {/* デバッグ情報表示 */}
        <div className="mt-2 p-2 bg-white rounded shadow text-xs">
          <div>訪問先: {locations.length}件</div>
          <div>読み込み: {isLoading ? 'Yes' : 'No'}</div>
          <div>エラー: {hasError ? 'Yes' : 'No'}</div>
          {locations.length > 0 && (
            <div className="mt-2 text-green-600">
              ✅ データ取得成功
            </div>
          )}
        </div>
      </div>

      {/* 訪問先オーバーレイ表示 */}
      {locations.length > 0 && (
        <div className="absolute top-20 left-4 z-10 bg-white rounded shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-3 text-sm">📍 訪問先一覧</h3>
          <div className="space-y-2">
            {locations.map(location => (
              <div 
                key={location.id} 
                className={`p-2 rounded text-xs transition-colors ${
                  selectedLocation?.id === location.id 
                    ? 'bg-blue-100 border-l-4 border-blue-500' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      location.isActive ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  ></div>
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-gray-500">{location.category}</div>
                    <div className="text-gray-400">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
            💡 地図上のピンをクリックすると訪問履歴が表示されます
          </div>
        </div>
      )}

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