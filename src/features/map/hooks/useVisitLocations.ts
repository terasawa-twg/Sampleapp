import { useState, useEffect, useCallback } from 'react';
import type { VisitLocation, ApiError } from '../types';
import { locationApi } from '@/features/map/services/locationApi';

// 訪問先データ管理フック
export function useVisitLocations() {
  const [locations, setLocations] = useState<VisitLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 訪問先データの取得
  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationApi.getAll();
      setLocations(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問先データの取得に失敗しました';
      setError(errorMessage);
      console.error('訪問先データ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 訪問先の追加
  const addLocation = useCallback(async (location: Omit<VisitLocation, 'id'>) => {
    try {
      setError(null);
      const newLocation = await locationApi.create(location);
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
      const updatedLocation = await locationApi.update(id, updates);
      setLocations(prev => prev.map(loc => loc.id === id ? updatedLocation : loc));
      return updatedLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問先の更新に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 訪問先の削除
  const deleteLocation = useCallback(async (id: string) => {
    try {
      setError(null);
      await locationApi.delete(id);
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