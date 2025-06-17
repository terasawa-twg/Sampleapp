'use client';

import { RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MapControlsProps } from '@/features/map/types/index';

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
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50"
      >
        <Plus className="h-4 w-4 mr-2" />
        訪問先を追加
      </Button>

      {/* 更新ボタン */}
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="bg-white hover:bg-gray-50 shadow-lg disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        更新
      </Button>
    </div>
  );
}