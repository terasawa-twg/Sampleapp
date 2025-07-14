// src/features/map/components/VisitHistoryPanel.tsx
// 訪問履歴パネルコンポーネント

"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VisitHistoryPanelProps } from "@/features/map/types/index";

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
    <div className="absolute right-0 bottom-0 left-0 z-10 max-h-80 overflow-hidden border-t border-gray-200 bg-white shadow-lg">
      <Card className="rounded-none border-0 shadow-none">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">訪問履歴</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="max-h-48 overflow-y-auto pt-0">
          <div className="mb-4">
            <h4 className="mb-1 font-medium text-gray-900">
              訪問先名: {selectedLocation.name}
            </h4>
          </div>

          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">
                履歴を読み込んでいます...
              </span>
            </div>
          )}

          {/* エラー状態 */}
          {error && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 履歴リスト */}
          {!isLoading && !error && (
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((historyItem) => (
                  <div
                    key={historyItem.id}
                    className="border-l-4 border-blue-500 py-2 pl-4"
                  >
                    <div className="mb-1 flex items-center justify-between">
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
                <div className="py-8 text-center text-gray-500">
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
