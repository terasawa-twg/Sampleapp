// src/features/map/components/VisitHistoryPanel.tsx
// 訪問履歴パネルコンポーネント

'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VisitHistoryPanelProps } from '@/features/map/types/index';

// 訪問履歴パネルコンポーネント
export default function VisitHistoryPanel({
  selectedLocation,
  history,
  isLoading,
  error,
  onClose,
}: VisitHistoryPanelProps) {
  if (!selectedLocation) return null;

  // エラーがある場合はエラーメッセージを表示
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-lg max-h-80 overflow-hidden">
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">訪問履歴</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 max-h-48 overflow-y-auto">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-1">
              訪問先名: {selectedLocation.name}
            </h4>
          </div>

          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">履歴を読み込んでいます...</span>
            </div>
          )}

          {/* エラー状態 */}
          {error && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 履歴リスト */}
          {!isLoading && !error && (
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map(historyItem => (
                  <div key={historyItem.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-600">
                        訪問日時: {historyItem.date}
                      </span>
                      <span className="text-sm text-gray-500">
                        ファイル数: {historyItem.files}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      訪問メモ: {historyItem.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>この場所の訪問履歴はまだありません。</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}