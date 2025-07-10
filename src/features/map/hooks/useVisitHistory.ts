// src/features/map/hooks/useVisitHistory.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/trpc/react';
import type { VisitHistory } from '../types';

// 訪問データの型定義
interface VisitData {
  visit_id: string | number;
  visit_date: string | Date;
  locations?: {
    name: string;
  } | null;
  visit_photos?: unknown[] | null;
  notes?: string | null;
}

// 訪問履歴データ管理フック（DB取得対応）
export function useVisitHistory(locationId?: string) {
  const [history, setHistory] = useState<VisitHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // locationIdをnumberに変換（tRPCスキーマに合わせる）
  const numericLocationId = locationId ? parseInt(locationId, 10) : undefined;

  // tRPCクエリを使用してDBから訪問履歴を取得
  const visitQuery = api.visits.getByLocationId.useQuery(
    { locationId: numericLocationId! },
    {
      enabled: !!numericLocationId && !isNaN(numericLocationId),
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // データ変換関数
  const transformVisitData = useCallback((visits: VisitData[]): VisitHistory[] => {
    return visits.map(visit => ({
      id: visit.visit_id.toString(),
      date: new Date(visit.visit_date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      location: visit.locations?.name ?? '不明な場所',
      files: visit.visit_photos?.length ?? 0,
      description: visit.notes ?? '訪問メモはありません',
    }));
  }, []);

  // tRPCクエリの状態を監視してstateを更新
  useEffect(() => {
    if (!numericLocationId || isNaN(numericLocationId)) {
      setHistory([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(visitQuery.isLoading);
    
    if (visitQuery.error) {
      setError(visitQuery.error.message ?? '訪問履歴の取得に失敗しました');
      setHistory([]);
    } else if (visitQuery.data) {
      try {
        const transformedData = transformVisitData(visitQuery.data as VisitData[]);
        setHistory(transformedData);
        setError(null);
      } catch (err) {
        console.error('データ変換エラー:', err);
        setError('データの処理に失敗しました');
        setHistory([]);
      }
    } else {
      setHistory([]);
      setError(null);
    }
  }, [
    numericLocationId,
    visitQuery.isLoading,
    visitQuery.error,
    visitQuery.data,
    transformVisitData,
  ]);

  // 手動でデータを再取得する関数
  const refetch = useCallback(() => {
    if (numericLocationId && !isNaN(numericLocationId)) {
      void visitQuery.refetch();
    }
  }, [numericLocationId, visitQuery]);

  // デバッグ用ログ
  useEffect(() => {
    console.log('useVisitHistory状況:', {
      locationId,
      numericLocationId,
      isLoading,
      error,
      historyCount: history.length,
      queryEnabled: !!numericLocationId && !isNaN(numericLocationId),
    });
  }, [locationId, numericLocationId, isLoading, error, history.length]);

  return {
    history,
    isLoading,
    error,
    refetch,
  };
}