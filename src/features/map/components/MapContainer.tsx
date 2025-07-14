// src/features/map/components/MapContainer.tsx
// マップ機能のメインコンテナコンポーネント

"use client";

import { useCallback, useMemo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useVisitLocations } from "../hooks/useVisitLocations";
import { useMapState } from "../hooks/useMapState";
import { useVisitHistory } from "../hooks/useVisitHistory";
import GeoloniaMap from "./GeoloniaMap";
import VisitHistoryPanel from "./VisitHistoryPanel";
import MapControls from "./MapControls";

// マップ機能のメインコンテナコンポーネント
export default function MapContainer() {
  // データ管理
  const {
    locations,
    isLoading: locationsLoading,
    error: locationsError,
    refetch,
  } = useVisitLocations();

  // 地図状態管理
  const {
    selectedLocation,
    mapError,
    selectLocation,
    deselectLocation,
    clearMapError,
  } = useMapState(locations);

  // 訪問履歴データ管理
  const {
    history,
    isLoading: historyLoading,
    error: historyError,
  } = useVisitHistory(selectedLocation?.id);

  // イベントハンドラー
  const handleLocationClick = useCallback(
    (locationId: string) => {
      console.log("handleLocationClick実行:", locationId);
      selectLocation(locationId);
    },
    [selectLocation],
  );

  const handleAddLocation = useCallback(() => {
    // TODO: 訪問先追加モーダルを開く
    console.log("訪問先を追加");
  }, []);

  // mapErrorの処理を最適化（依存配列を空にして安定化）
  const handleMapError = useCallback((error: Error) => {
    console.error("地図エラー:", error);
    // setMapErrorを直接呼ばずに、エラーメッセージを保存
  }, []);

  // refetch処理を最適化
  const handleRetry = useCallback(async () => {
    clearMapError();
    await refetch();
  }, [clearMapError, refetch]);

  // 状態の計算
  const hasError = locationsError ?? mapError;
  const isLoading = locationsLoading;

  // selectedLocationIdを安定化
  const selectedLocationId = useMemo(() => {
    return selectedLocation?.id ?? null;
  }, [selectedLocation?.id]);

  // エラー状態を安定化
  const errorState = useMemo(() => {
    return hasError ? (locationsError ?? mapError) : null;
  }, [hasError, locationsError, mapError]);

  // デバッグ用：データの状況をコンソールに出力
  console.log("MapContainer状況:", {
    locationsCount: locations.length,
    isLoading,
    hasError,
    selectedLocationId: selectedLocationId,
    selectedLocationName: selectedLocation?.name ?? null,
    locations: locations,
    locationNames: locations.map((loc) => loc.name),
  });

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* エラー表示 */}
      {hasError && (
        <div className="absolute top-4 left-1/2 z-20 mx-4 w-full max-w-md -translate-x-1/2 transform">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    エラーが発生しました
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    {locationsError ?? mapError}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRetry()}
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
          selectedLocationId={selectedLocationId}
          isLoading={isLoading}
          error={errorState}
          onLocationClick={handleLocationClick}
          onMapError={handleMapError}
          disableNewMarker={true}
        />
      </div>

      {/* 地図コントロール */}
      <div className="absolute top-4 right-4 z-10">
        <MapControls
          onAddLocation={handleAddLocation}
          onRefresh={() => void handleRetry()}
          isLoading={isLoading}
          hasError={!!hasError}
        />

        {/* デバッグ情報表示 */}
        <div className="mt-2 rounded bg-white p-2 text-xs shadow">
          <div>訪問先: {locations.length}件</div>
          <div>読み込み: {isLoading ? "Yes" : "No"}</div>
          <div>エラー: {hasError ? "Yes" : "No"}</div>
          {locations.length > 0 && (
            <div className="mt-2 text-green-600">✅ データ取得成功</div>
          )}
        </div>
      </div>

      {/* 地図上部のメッセージ表示 */}
      <div className="absolute top-20 left-4 z-10 max-w-xs">
        <div className="rounded bg-blue-50 p-2 text-xs">
          💡 地図上のピンをクリックすると訪問履歴が表示されます
        </div>
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
