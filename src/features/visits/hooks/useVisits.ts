import { api } from '@/trpc/react';
import type { VisitFilters } from '@/features/visits/types';

/**
 * 訪問履歴一覧を取得するフック
 * @param filters - 検索・フィルター条件
 * @returns 訪問履歴一覧データ
 */
export const useVisits = (filters?: VisitFilters) => {
  // フィルターがある場合は期間検索を使用、ない場合は全件取得
  if (filters?.startDate || filters?.endDate || filters?.userId) {
    return api.visits.getByDateRange.useQuery({
      startDate: filters.startDate ?? new Date('2000-01-01'),
      endDate: filters.endDate ?? new Date('2099-12-31'),
      userId: filters.userId,
    });
  }
  
  // フィルターなしの場合は全件取得
  return api.visits.getAll.useQuery();
};

/**
 * 訪問履歴削除のフック
 * @returns 削除用のmutation
 */
export const useDeleteVisit = () => {
  const utils = api.useUtils();
  
  return api.visits.delete.useMutation({
    onSuccess: () => {
      // 削除後に一覧を再取得
      utils.visits.getAll.invalidate();
    },
    onError: (error) => {
      console.error('訪問履歴の削除に失敗しました:', error);
    },
  });
};