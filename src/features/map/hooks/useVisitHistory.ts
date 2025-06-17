import { useState, useEffect, useCallback } from 'react';
import type { VisitHistory } from '../types';

// 訪問履歴データ管理フック
export function useVisitHistory(locationName?: string) {
  const [history, setHistory] = useState<VisitHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: 実際のAPI呼び出しに置き換える
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockHistory: VisitHistory[] = [
        {
          id: '1',
          date: '2025年5月1日',
          location: name,
          files: 3,
          description: 'プロジェクトの概要を説明しました。'
        },
        {
          id: '2',
          date: '2025年6月6日',
          location: name,
          files: 2,
          description: '訪問メモ営業検討#2を実施し、進捗を確認しました。'
        }
      ];
      
      setHistory(mockHistory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問履歴の取得に失敗しました';
      setError(errorMessage);
      console.error('訪問履歴取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!locationName) {
      setHistory([]);
      setError(null);
      return;
    }

    fetchHistory(locationName);
  }, [locationName, fetchHistory]);

  const refetch = useCallback(() => {
    if (locationName) {
      fetchHistory(locationName);
    }
  }, [locationName, fetchHistory]);

  return {
    history,
    isLoading,
    error,
    refetch,
  };
}