import type { VisitLocation } from '@/features/visit-history/types/index';

export const locationService = {
  // 全ての訪問先を取得
  getAll: async (): Promise<VisitLocation[]> => {
    try {
      const response = await fetch('/api/locations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('訪問先取得エラー:', error);
      throw error;
    }
  },

  // 特定の訪問先を取得
  getById: async (id: number): Promise<VisitLocation | null> => {
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('訪問先取得エラー:', error);
      throw error;
    }
  },
};