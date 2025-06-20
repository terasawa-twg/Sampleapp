import { useState, useEffect, useCallback } from 'react';
import type { VisitLocation, ApiError } from '../types';
// 一時的にAPIを使わずに直接データを設定
// import { locationApi } from '../services/locationApi';

// 訪問先データ管理フック
export function useVisitLocations() {
  const [locations, setLocations] = useState<VisitLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 訪問先データの取得
  const fetchLocations = useCallback(async () => {
    try {
      console.log('useVisitLocations: データ取得開始');
      setIsLoading(true);
      setError(null);

      // 一時的に直接データを設定（API呼び出しを回避）
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockLocations: VisitLocation[] = [
        {
          id: '1',
          name: 'ABC商店',
          lat: 35.6762,
          lng: 139.6503,
          category: '商店',
          isActive: false
        },
        {
          id: '2',
          name: 'XYZ商店',
          lat: 35.6812,
          lng: 139.6587,
          category: '商店',
          isActive: false
        },
        {
          id: '3',
          name: '株式会社サンプル',
          lat: 35.6895,
          lng: 139.6917,
          category: '企業',
          isActive: true
        }
      ];
      
      console.log('useVisitLocations: データ取得成功', mockLocations.length, '件');
      setLocations(mockLocations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問先データの取得に失敗しました';
      setError(errorMessage);
      console.error('useVisitLocations: エラー', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 訪問先の追加
  const addLocation = useCallback(async (location: Omit<VisitLocation, 'id'>) => {
    try {
      setError(null);
      const newLocation: VisitLocation = {
        id: Date.now().toString(),
        ...location,
      };
      setLocations(prev => [...prev, newLocation]);
      return newLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問先の追加に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 訪問先の更新
  const updateLocation = useCallback(async (id: string, updates: Partial<VisitLocation>) => {
    try {
      setError(null);
      const updatedLocation = { ...locations.find(loc => loc.id === id)!, ...updates };
      setLocations(prev => prev.map(loc => loc.id === id ? updatedLocation : loc));
      return updatedLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問先の更新に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [locations]);

  // 訪問先の削除
  const deleteLocation = useCallback(async (id: string) => {
    try {
      setError(null);
      setLocations(prev => prev.filter(loc => loc.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問先の削除に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 初期データの取得
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // エラーハンドリング
  return {
    locations,
    isLoading,
    error,
    refetch: fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
  };
}