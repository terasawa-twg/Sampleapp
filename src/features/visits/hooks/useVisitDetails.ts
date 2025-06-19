import { api } from '@/trpc/react';

/**
 * 訪問履歴詳細取得フック（拡張版）
 * - 指定された訪問の詳細を取得
 * - 写真データも取得
 * - 同じ場所への過去の訪問履歴も取得
 */
export const useVisitDetails = (visitId: number) => {
  // 詳細データ取得
  const { data: visit, isLoading: isVisitLoading, error: visitError } = api.visits.getById.useQuery(
    { id: visitId },
    { enabled: !!visitId }
  );

  // 写真データ取得
  const { data: photos, isLoading: isPhotosLoading } = api.visitPhotos.getByVisitId.useQuery(
    { visitId },
    { enabled: !!visitId }
  );

  // 同じ場所への訪問履歴取得（現在の訪問以外）
  const { data: locationVisits, isLoading: isLocationVisitsLoading } = api.visits.getByLocationId.useQuery(
    { locationId: visit?.location_id ?? 0 },
    { 
      enabled: !!visit?.location_id,
      select: (data) => {
        // 現在の訪問を除外し、日付順にソート
        return data
          ?.filter(v => v.visit_id !== visitId)
          ?.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()) ?? [];
      }
    }
  );

  return {
    visit,
    photos,
    locationVisits: locationVisits ?? [],
    /*論理値ORのため||を維持*/
    isLoading: isVisitLoading || isPhotosLoading || isLocationVisitsLoading,
    error: visitError,
  };
};