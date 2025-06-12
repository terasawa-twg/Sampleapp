import { api } from '@/trpc/react';

/**
 * 訪問履歴の詳細情報を取得するフック
 * @param visitId - 訪問履歴ID
 * @returns 詳細データ（訪問情報 + 写真）
 */
export const useVisitDetails = (visitId: number) => {
  const visitQuery = api.visits.getById.useQuery({ id: visitId });
  const photosQuery = api.visitPhotos.getByVisitId.useQuery({ visitId });

  // デバッグ用ログ
  console.log('Visit Query Data:', visitQuery.data);
  console.log('Photos Query Data:', photosQuery.data);

  return {
    visit: visitQuery.data,
    photos: photosQuery.data || [],
    isLoading: visitQuery.isLoading || photosQuery.isLoading,
    error: visitQuery.error || photosQuery.error,
    refetch: () => {
      visitQuery.refetch();
      photosQuery.refetch();
    },
  };
};

/**
 * 特定の場所の訪問履歴を取得するフック
 * @param locationId - 場所ID
 * @returns その場所への訪問履歴一覧
 */
export const useVisitsByLocation = (locationId: number) => {
  return api.visits.getByLocationId.useQuery({ locationId });
};