// src/features/map/components/MapControls.tsx
// マップコントロールコンポーネント

"use client";

import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MapControlsProps } from "@/features/map/types/index";

// マップコントロールコンポーネント
export default function MapControls({
  onAddLocation,
  onRefresh,
  isLoading,
  hasError,
}: MapControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 訪問先追加ボタン */}
      <Button
        onClick={onAddLocation}
        disabled={hasError || isLoading}
        className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <Plus className="mr-2 h-4 w-4" />
        訪問先を追加
      </Button>

      {/* 更新ボタン */}
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        />
        更新
      </Button>
    </div>
  );
}
