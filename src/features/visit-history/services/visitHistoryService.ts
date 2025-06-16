import type { CreateVisitData } from '../types';

// 実際のAPI呼び出しサービス
export const visitHistoryService = {
  // 訪問履歴を作成
  create: async (data: CreateVisitData) => {
    try {
      const response = await fetch('/api/visit-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location_id: data.location_id,
          visit_date: data.visit_date.toISOString(),
          notes: data.notes,
          rating: data.rating,
          created_by: data.created_by,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API呼び出しエラー:', error);
      throw error;
    }
  },

  // tRPCを使った作成（代替案）
  createWithTRPC: async (data: CreateVisitData) => {
    // TODO: tRPCが使用可能になったら実装
    throw new Error('tRPC is not available yet');
  },
};