import { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';
import type { VisitLocation } from '../types';

export const useLocations = () => {
  const [locations, setLocations] = useState<VisitLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 訪問先データを取得
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await locationService.getAll();
      setLocations(data);
      
      console.log('訪問先データ取得成功:', data.length, '件');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '訪問先の取得に失敗しました';
      setError(errorMessage);
      console.error('訪問先取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時に取得
  useEffect(() => {
    fetchLocations();
  }, []);

  // 特定のIDの訪問先を検索
  const findLocationById = (id: number): VisitLocation | undefined => {
    return locations.find(location => location.location_id === id);
  };

  // 名前で訪問先を検索
  const findLocationByName = (name: string): VisitLocation | undefined => {
    return locations.find(location => location.name === name);
  };

  // データを再取得
  const refetch = () => {
    fetchLocations();
  };

  return {
    // 状態
    locations,
    isLoading,
    error,
    // メソッド
    findLocationById,
    findLocationByName,
    refetch,
  };
};