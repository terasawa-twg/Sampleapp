// src/features/map/hooks/useVisitLocations.ts

import { useCallback } from 'react';
import { api } from '@/trpc/react';
import type { VisitLocation } from '../types';

// DB結果の型定義
interface DbLocation {
  location_id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  description?: string | null;
  _count?: {
    visits: number;
  } | null;
}

// DB結果をフロントエンド用の型に変換する関数
function transformDbLocationToVisitLocation(dbLocation: DbLocation): VisitLocation {
  return {
    id: dbLocation.location_id.toString(),
    name: dbLocation.name,
    lat: dbLocation.latitude,
    lng: dbLocation.longitude,
    category: dbLocation.address ?? '未分類', // addressをcategoryとして使用
    isActive: (dbLocation._count?.visits ?? 0) > 0, // 訪問履歴があるかどうか
    address: dbLocation.address ?? undefined,
    description: dbLocation.description ?? undefined,
  };
}

// 訪問先データ管理フック（tRPC使用）
export function useVisitLocations() {
  // tRPCのuseQueryを使用してデータ取得
  const {
    data: dbLocations,
    isLoading,
    error: queryError,
    refetch,
  } = api.locations.getAll.useQuery(undefined, {
    // エラーハンドリングとリトライ設定
    retry: 3,
    retryDelay: 1000,
  });

  // tRPCのuseMutationを使用
  const createMutation = api.locations.create.useMutation({
    onSuccess: () => {
      // 作成成功後にデータを再取得
      void refetch();
    },
  });
  
  const updateMutation = api.locations.update.useMutation({
    onSuccess: () => {
      // 更新成功後にデータを再取得
      void refetch();
    },
  });
  
  const deleteMutation = api.locations.delete.useMutation({
    onSuccess: () => {
      // 削除成功後にデータを再取得
      void refetch();
    },
  });

  // DB結果を変換
  const locations: VisitLocation[] = dbLocations
    ? dbLocations.map(loc => {
        // 型安全のためlatitude/longitudeをnumberへ変換
        const dbLoc = {
          ...loc,
          latitude: typeof loc.latitude === 'object' && 'toNumber' in loc.latitude
            ? Number(loc.latitude.toNumber())
            : Number(loc.latitude),
          longitude: typeof loc.longitude === 'object' && 'toNumber' in loc.longitude
            ? Number(loc.longitude.toNumber())
            : Number(loc.longitude),
        } as DbLocation;
        return transformDbLocationToVisitLocation(dbLoc);
      })
    : [];

  // エラーメッセージの処理
  const error = queryError?.message ?? createMutation.error?.message ?? 
                updateMutation.error?.message ?? deleteMutation.error?.message ?? null;

  // 訪問先の追加
  const addLocation = useCallback(async (location: Omit<VisitLocation, 'id'>) => {
    try {
      console.log('useVisitLocations: 訪問先追加開始', location);

      // TODO: 実際のユーザーIDを取得する（認証機能実装後）
      const created_by = 1; // 仮のユーザーID
      
      const dbLocation = await createMutation.mutateAsync({
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        address: location.address ?? '',
        description: location.description ?? '',
        created_by,
      });

      // Decimal型のlatitude/longitudeをnumberに変換
      const dbLoc = {
        ...dbLocation,
        latitude: typeof dbLocation.latitude === 'object' && 'toNumber' in dbLocation.latitude
          ? Number(dbLocation.latitude.toNumber())
          : Number(dbLocation.latitude),
        longitude: typeof dbLocation.longitude === 'object' && 'toNumber' in dbLocation.longitude
          ? Number(dbLocation.longitude.toNumber())
          : Number(dbLocation.longitude),
      } as DbLocation;

      const newLocation = transformDbLocationToVisitLocation(dbLoc);
      console.log('useVisitLocations: 訪問先追加成功', newLocation);

      return newLocation;
    } catch (err) {
      console.error('useVisitLocations: 訪問先追加エラー', err);
      const errorMessage = err instanceof Error ? err.message : '訪問先の追加に失敗しました';
      throw new Error(errorMessage);
    }
  }, [createMutation]);

  // 訪問先の更新
  const updateLocation = useCallback(async (id: string, updates: Partial<VisitLocation>) => {
    try {
      console.log('useVisitLocations: 訪問先更新開始', { id, updates });

      // TODO: 実際のユーザーIDを取得する（認証機能実装後）
      const updated_by = 1; // 仮のユーザーID
      
      const dbLocation = await updateMutation.mutateAsync({
        id: parseInt(id),
        name: updates.name ?? '',
        latitude: updates.lat ?? 0,
        longitude: updates.lng ?? 0,
        address: updates.address ?? '',
        description: updates.description ?? '',
        updated_by,
      });

      const dbLoc = {
        ...dbLocation,
        latitude: typeof dbLocation.latitude === 'object' && 'toNumber' in dbLocation.latitude
          ? Number(dbLocation.latitude.toNumber())
          : Number(dbLocation.latitude),
        longitude: typeof dbLocation.longitude === 'object' && 'toNumber' in dbLocation.longitude
          ? Number(dbLocation.longitude.toNumber())
          : Number(dbLocation.longitude),
      } as DbLocation;

      const updatedLocation = transformDbLocationToVisitLocation(dbLoc);
      console.log('useVisitLocations: 訪問先更新成功', updatedLocation);
      
      return updatedLocation;
    } catch (err) {
      console.error('useVisitLocations: 訪問先更新エラー', err);
      const errorMessage = err instanceof Error ? err.message : '訪問先の更新に失敗しました';
      throw new Error(errorMessage);
    }
  }, [updateMutation]);

  // 訪問先の削除
  const deleteLocation = useCallback(async (id: string) => {
    try {
      console.log('useVisitLocations: 訪問先削除開始', id);
      
      await deleteMutation.mutateAsync({
        id: parseInt(id),
      });
      
      console.log('useVisitLocations: 訪問先削除成功', id);
    } catch (err) {
      console.error('useVisitLocations: 訪問先削除エラー', err);
      const errorMessage = err instanceof Error ? err.message : '訪問先の削除に失敗しました';
      throw new Error(errorMessage);
    }
  }, [deleteMutation]);

  console.log('useVisitLocations状況:', {
    locationsCount: locations.length,
    isLoading,
    error,
    locations: locations.map(loc => ({ id: loc.id, name: loc.name }))
  });

  return {
    locations,
    isLoading,
    error,
    refetch,
    addLocation,
    updateLocation,
    deleteLocation,
  };
}